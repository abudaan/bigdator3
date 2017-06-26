// @flow

// step 1: Load application config; this is a yaml file that describes the
// Vega specs that are used and how the signals of each of these specs should
// be mapped onto one and eachother.
//
// step 2: Load the yaml file that contains the dataset that is used in all
// Vega views
//
// step 3: Load all Vega specs, initialize them in the html page intheir own
// div elements and load the dataset
//
// step 4: Here we apply all mappings of signals described in the yaml file.
// Before the listeners are added we check if the sigals exist in both the
// emitter and the listeners.

import 'babel-polyfill';
import R from 'ramda';
import { fetchJSON, fetchYAML } from './util/fetch_helpers';

const vega = global.vega; // coding like it's 1999
const now: number = Date.now();
const app: null | HTMLElement = document.getElementById('app');
const mapIndexed = R.addIndex(R.map);
const configUrl: string = './assets/data/config.yaml';

// step 3
const setupViews = (promises: Promise<*>[], names: string[], dataset: DataSetType): Promise<*> => {
    const viewMap: { [id: string]: vega.View } = {};
    return Promise.all(promises).then(
        // resolve
        (specs: SpecType[]): ViewMapType => {
            // Initialize all specs in their own newly created <div>
            mapIndexed((spec: SpecType, i: number) => {
                const elem: HTMLElement = document.createElement('div');
                const name: string = names[i];
                elem.id = name;
                elem.className = 'view';
                if (app !== null) {
                    app.appendChild(elem);
                    // const ds = R.clone(dataset);
                    viewMap[name] = new vega.View(vega.parse(spec))
                        .renderer('svg')
                        // .logLevel(vega.Debug)
                        .initialize(`#${name}`)
                        .insert(dataset.name, dataset.values)
                        // .insert(ds.name, ds.values)
                        .run();
                }
            }, specs);
            return Promise.resolve(viewMap);
        });
};

// step 4
const mapSignals = (specs: SpecType[], viewMap: ViewMapType) => {
    R.forEach((spec: SpecType) => {
        const listener = viewMap[spec.name];
        const listenerSignals = R.keys(listener.getState().signals);
        // console.log('listener', listenerSignals);
        R.forEach((b: BindType) => {
            const emitter = viewMap[b.name];
            const emitterSignals = R.keys(emitter.getState().signals);
            // console.log('emitter', emitterSignals);
            R.forEach((signal: string | [string, string]) => {
                let emitterSignal = signal;
                let listenerSignal = signal;
                if (R.isArrayLike(signal) === true) {
                    emitterSignal = signal[0];
                    listenerSignal = signal[1];
                }
                // check if the signals exist
                const emitterHasSignal = R.findIndex((s: string): boolean =>
                    s === emitterSignal)(emitterSignals) !== -1;
                const listenerHasSignal = R.findIndex((s: string): boolean =>
                    s === listenerSignal)(listenerSignals) !== -1;
                // console.log(emitterSignal, emitterSignals, listenerSignal, listenerSignals);
                if (emitterHasSignal && listenerHasSignal) {
                    // The 'dataUpdate' signal is special signal that requires a different handler
                    if (emitterSignal === 'dataUpdate') {
                        emitter.addSignalListener(emitterSignal,
                            (name: string, data: { name: string, values: DataType[] }) => {
                                // console.log(data.name, data.values);
                                listener.remove(data.name, (): boolean => true).run();
                                listener.insert(data.name, data.values).run();
                            });
                    } else {
                        emitter.addSignalListener(emitterSignal, (name: string, data: *) => {
                            // console.log(name, data);
                            listener.signal(listenerSignal, data).run();
                        });
                    }
                }
            }, b.signals || []);
        }, spec.bind);
    }, specs);
};

// step 1: load config
fetchYAML(`${configUrl}?${now}`).then((config: ConfigType) => {
    // step 2: load dataset
    const baseUrl: string = config.baseurl;
    fetchYAML(`${baseUrl}${config.data}?${now}`).then((dataset: DataSetType) => {
        // step 3: load and initialize Vega views
        const promises: Promise<*>[] = R.map((spec: SpecType): Promise<*>[] =>
            fetchJSON(`${baseUrl}${spec.url}?${now}`), config.specs);
        const names: string[] = R.map((s: SpecType): string => s.name, config.specs);
        setupViews(promises, names, dataset).then((viewMap: ViewMapType) => {
            // step 4: map signals
            mapSignals(config.specs, viewMap);
        });
    });
});
