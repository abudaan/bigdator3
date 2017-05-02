// @flowoff
import 'babel-polyfill';
import R from 'ramda';
import { fetchJSON } from './util/fetch_helpers';

const vega = global.vega; // coding like it's 1999
let highlight;
let view1;
let view2;

fetchJSON('./assets/data/vega1.vg.json')
.then((data) => {
    view1 = new vega.View(vega.parse(data))
    .renderer('canvas')
    .initialize('#view1')
    // .hover()
    .run();
})
.then(() => fetchJSON('./assets/data/vega2.vg.json'))
.then((data) => {
    view2 = new vega.View(vega.parse(data))
    .renderer('svg')
    .initialize('#view2')
    // .hover()
    .run();
})
.then(() => {
    /*
    view1.addSignalListener('tooltip', (name, data) => {
        view2.signal('tooltip', data).run();
        // view2.change('highlight',
        //     vega.changeset()
        //     .insert([data])
        //     .remove(highlight),
        // ).run();
        // highlight = data;
    });
    */
    view2.addSignalListener('tooltip', (name, data) => {
        view1.signal('tooltip', data).run();
        console.log(view1.getState());
        // view1.change('highlight',
        //     vega.changeset()
        //     .insert([data])
        //     .remove(highlight),
        // ).run();
        // highlight = data;
    });
});
