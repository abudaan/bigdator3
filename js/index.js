import 'babel-polyfill';
import R from 'ramda';
import { fetchJSON } from './util/fetch_helpers';

const vega = global.vega; // coding like it's 1999
let view1;
let view2;
const now = Date.now();

fetchJSON(`./assets/data/vega1.vg.json?${now}`)
    .then((data) => {
        view1 = new vega.View(vega.parse(data))
            .renderer('svg')
            // .logLevel(vega.Debug)
            .initialize('#view1');
    })
    .then(() => fetchJSON(`./assets/data/vega2.vg.json?${now}`))
    .then((data) => {
        view2 = new vega.View(vega.parse(data))
            .renderer('svg')
            // .logLevel(vega.Debug)
            .initialize('#view2');
    })
    .then(() => fetchJSON(`./assets/data/data.json?${now}`))
    .then((dataset) => {
        // console.log(R.keys(view1.getState().signals));
        view1.change('table',
            vega.changeset()
                .insert(dataset),
        ).run();
        view2.change('table',
            vega.changeset()
                .insert(dataset),
        ).run();

        view1.addSignalListener('tooltip', (name, data) => {
            view2.signal('tooltip', data).run();
        });
        view2.addSignalListener('tooltip', (name, data) => {
            view1.signal('tooltip', data).run();
        });
        view1.addSignalListener('dataUpdate', (name, data) => {
            view2.remove(data.name, () => true).run();
            view2.insert(data.name, data.values).run();
        });
        view2.addSignalListener('selectedCategory', (name, category) => {
            view1.signal('selectedCategory', category).run();
        });
        view1.addSignalListener('selectedCategory', (name, category) => {
            view2.signal('selectedCategory', category).run();
        });
    });
