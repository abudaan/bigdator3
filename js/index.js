import 'babel-polyfill';
import R from 'ramda';
import { fetchJSON } from './util/fetch_helpers';
import bindings from '../assets/data/bindings';

const vega = global.vega; // coding like it's 1999
let view1;
let view2;

const now = Date.now();
// @todo: load specs and data from bindings json

fetchJSON(`./assets/data/view1.vg.json?${now}`)
    .then((data) => {
        view1 = new vega.View(vega.parse(data))
            .renderer('svg')
            // .logLevel(vega.Debug)
            .initialize('#view1');
    })
    .then(() => fetchJSON(`./assets/data/view2.vg.json?${now}`))
    .then((data) => {
        view2 = new vega.View(vega.parse(data))
            .renderer('svg')
            // .logLevel(vega.Debug)
            .initialize('#view2');
    })
    .then(() => fetchJSON(`./assets/data/data.json?${now}`))
    .then((dataset) => {
        view1.change('table',
            vega.changeset()
                .insert(dataset),
        ).run();
        view2.change('table',
            vega.changeset()
                .insert(dataset),
        ).run();

        const viewMap = {
            vega1: view1,
            vega2: view2,
        };

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
