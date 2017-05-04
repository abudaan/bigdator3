import 'babel-polyfill';
import R from 'ramda';
import { fetchJSON } from './util/fetch_helpers';
import bindings from '../assets/data/bindings'; // should be loaded over http as yaml or cson file

const vega = global.vega; // coding like it's 1999
const viewMap: { [id: string]: vega.View } = {};
const now: number = Date.now();
const baseUrl: string = bindings.baseurl;
const app: null | HTMLElement = document.getElementById('app');
const mapIndexed = R.addIndex(R.map);

fetchJSON(`${baseUrl}${bindings.data}?${now}`)
    .then((dataset) => {
        const promises: Promise<*>[] = R.map(spec => fetchJSON(`${baseUrl}${spec.url}?${now}`), bindings.specs);
        Promise.all(promises)
            .then((values) => {
                mapIndexed((spec, i) => {
                    const elem: HTMLElement = document.createElement('div');
                    const name: string = bindings.specs[i].name;
                    elem.id = name;
                    if (app !== null) {
                        app.appendChild(elem);
                        viewMap[name] = new vega.View(vega.parse(spec))
                            .renderer('svg')
                            // .logLevel(vega.Debug)
                            .initialize(`#${name}`)
                            .insert(dataset.name, dataset.values)
                            .run();
                    }
                }, values);
                return Promise.resolve();
            })
            .then(() => {
                R.forEach((spec) => {
                    const listener = viewMap[spec.name];
                    const listenerSignals = R.keys(listener.getState().signals);
                    // console.log('listener', listenerSignals);
                    R.forEach((b) => {
                        const emitter = viewMap[b.name];
                        const emitterSignals = R.keys(emitter.getState().signals);
                        // console.log('emitter', emitterSignals);
                        R.forEach((signal) => {
                            if (R.findIndex(s => signal === s)(emitterSignals) !== -1 &&
                                R.findIndex(s => signal === s)(listenerSignals) !== -1) {
                                if (signal === 'dataUpdate') {
                                    emitter.addSignalListener(signal, (name, data) => {
                                        listener.remove(data.name, () => true).run();
                                        listener.insert(data.name, data.values).run();
                                    });
                                } else {
                                    emitter.addSignalListener(signal, (name, data) => {
                                        listener.signal(name, data).run();
                                    });
                                }
                            }
                        }, b.signals);
                    }, spec.bind);
                }, bindings.specs);
            });
    });

