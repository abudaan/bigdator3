import 'babel-polyfill';
import R from 'ramda';
import { fetchJSON } from './util/fetch_helpers';

const vega = global.vega; // coding like it's 1999
let view1;
let view2;
const now = Date.now();
let dataState = {};

const signalListenerView1 = (name, data) => {
    view1.signal('tooltip', data).run();
};

const signalListenerView2 = (name, data) => {
    view2.signal('tooltip', data).run();
};

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
    dataState = R.clone(dataset);
    view1.change('table',
        vega.changeset()
        .insert(dataset),
    ).run();
    view2.change('table',
        vega.changeset()
        .insert(dataset),
    ).run();

    view1.addSignalListener('tooltip', signalListenerView2);
    view2.addSignalListener('tooltip', signalListenerView1);

    view1.addSignalListener('changeAmount', (name, data) => {
        const index = R.findIndex(R.propEq('category', data.category))(dataState);
        if (index !== -1) {
            const catLens = R.lensIndex(index);
            dataState = R.set(catLens, data, dataState);
            // view2.remove('table', d => d.category === data.category).run();
            // view2.insert('table', data).run();

            setTimeout(() => {
                // view1.remove('table', d => d.category === data.category).run();
                // view1.insert('table', data).run();
                view1.remove('table', () => true).run();
                view1.insert('table', dataState).run();
            }, 0);

            // view2.change('table', vega.changeset().remove(dataset).insert(clone)).run();
            view2.remove('table', () => true).run();
            view2.insert('table', dataState).run();
        }
    });

    view2.addSignalListener('changeAmount', (name, data) => {
        const index = R.findIndex(R.propEq('category', data.category))(dataState);
        if (index !== -1) {
            const catLens = R.lensIndex(index);
            dataState = R.set(catLens, data, dataState);

            setTimeout(() => {
                view2.remove('table', () => true).run();
                view2.insert('table', dataState).run();
            }, 0);

            view1.remove('table', () => true).run();
            view1.insert('table', dataState).run();
        }
    });

    view2.addSignalListener('selectedCategory', (name, category) => {
        view1.signal('selectedCategory', category).run();
    });

    view1.addSignalListener('selectedCategory', (name, category) => {
        view2.signal('selectedCategory', category).run();
    });
});
