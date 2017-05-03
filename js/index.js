import 'babel-polyfill';
import R from 'ramda';
import { fetchJSON } from './util/fetch_helpers';

const vega = global.vega; // coding like it's 1999
let view1;
let view2;
// const elementView1 = document.getElementById('view1');
// const elementView2 = document.getElementById('view2');
const now = Date.now();

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
    // .hover()
    .initialize('#view1');
})
.then(() => fetchJSON(`./assets/data/vega2.vg.json?${now}`))
.then((data) => {
    view2 = new vega.View(vega.parse(data))
    .renderer('svg')
    // .logLevel(vega.Debug)
    // .hover()
    .initialize('#view2');
})
.then(() => fetchJSON(`./assets/data/data.json?${now}`))
.then((data) => {
    view1.change('table',
        vega.changeset()
        .insert(data),
    ).run();
    view2.change('table',
        vega.changeset()
        .insert(data),
    ).run();

    view1.addSignalListener('tooltip', signalListenerView2);
    view2.addSignalListener('tooltip', signalListenerView1);
    // elementView2.addEventListener('mouseenter', () => {
    //     console.log('enter');
    //     view2.addSignalListener('tooltip', signalListenerView1);
    // });
    // elementView2.addEventListener('mouseleave', () => {
    //     console.log('leave');
    //     view2.removeSignalListener('tooltip', signalListenerView1);
    // });
});
