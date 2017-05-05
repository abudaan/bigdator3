import 'babel-polyfill';
import R from 'ramda';
import { fetchJSON, fetchYAML } from './util/fetch_helpers';

const vega = global.vega; // coding like it's 1999
const viewMap: { [id: string]: vega.View } = {};
const now: number = Date.now();
const app: null | HTMLElement = document.getElementById('app');
const mapIndexed = R.addIndex(R.map);

// Step 1: Get the application config; this yaml file describes the vega specs that are used
// and how the signals of each of these specs are mapped onto one and eachother.
fetchYAML(`./assets/data/config.yaml?${now}`)
    .then((config) => {
        // debugger;
        const baseUrl: string = config.baseurl;
        // Step 2: load the file containing the dataset that is used in all specs.
        fetchYAML(`${baseUrl}${config.data}?${now}`)
            .then((dataset) => {
                // Step 3: load all specs in the config.yaml file
                const promises: Promise<*>[] = R.map(spec => fetchJSON(`${baseUrl}${spec.url}?${now}`), config.specs);
                Promise.all(promises)
                    .then((values) => {
                        // Initialize all specs in their own newly created <div>
                        mapIndexed((spec, i) => {
                            const elem: HTMLElement = document.createElement('div');
                            const name: string = config.specs[i].name;
                            elem.id = name;
                            elem.className = 'view';
                            if (app !== null) {
                                app.appendChild(elem);
                                const ds = R.clone(dataset);
                                viewMap[name] = new vega.View(vega.parse(spec))
                                    .renderer('svg')
                                    // .logLevel(vega.Debug)
                                    .initialize(`#${name}`)
                                    // .insert(dataset.name, dataset.values)
                                    .insert(ds.name, ds.values)
                                    .run();
                            }
                        }, values);
                        return Promise.resolve();
                    })
                    .then(() => {
                        // Step 4: Here we apply all mappings of signals described in the yaml file.
                        // Before the listeners are added we check if the sigals exist in both the
                        // emitter and the listeners.
                        R.forEach((spec) => {
                            const listener = viewMap[spec.name];
                            const listenerSignals = R.keys(listener.getState().signals);
                            // console.log('listener', listenerSignals);
                            R.forEach((b) => {
                                const emitter = viewMap[b.name];
                                const emitterSignals = R.keys(emitter.getState().signals);
                                // console.log('emitter', emitterSignals);
                                R.forEach((signal) => {
                                    let emitterSignal = signal;
                                    let listenerSignal = signal;
                                    if (R.isArrayLike(signal) === true) {
                                        emitterSignal = signal[0];
                                        listenerSignal = signal[1];
                                    }
                                    // console.log(emitterSignal, emitterSignals, listenerSignal, listenerSignals);
                                    if (R.findIndex(s => s === emitterSignal)(emitterSignals) !== -1 &&
                                        R.findIndex(s => s === listenerSignal)(listenerSignals) !== -1) {
                                        // The 'dataUpdate' signal is special signal that requires a different handler
                                        if (emitterSignal === 'dataUpdate') {
                                            emitter.addSignalListener(emitterSignal, (name, data) => {
                                                // console.log(name);
                                                listener.remove(data.name, () => true).run();
                                                listener.insert(data.name, data.values).run();
                                            });
                                        } else {
                                            emitter.addSignalListener(emitterSignal, (name, data) => {
                                                // console.log(name, data);
                                                listener.signal(listenerSignal, data).run();
                                            });
                                        }
                                    }
                                }, b.signals || []);
                            }, spec.bind);
                        }, config.specs);
                    });
            });
    });
