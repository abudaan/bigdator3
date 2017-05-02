// @flowoff
import 'babel-polyfill';
import R from 'ramda';
import { fetchJSON } from './util/fetch_helpers';

const vega = global.vega;
const alphabet = 'ABCDEFGHIJK';

let view1;
let view2;
let highlightedPoint = null;

fetchJSON('./assets/data/vega1.vg.json')
.then((data) => {
    view1 = new vega.View(vega.parse(data))
    .renderer('canvas')
    .initialize('#view1')
    .hover()
    .run();
})
.then(() => fetchJSON('./assets/data/vega2.vg.json'))
.then((data) => {
    view2 = new vega.View(vega.parse(data))
    .renderer('canvas')
    .initialize('#view2')
    .run();
})
.then(() => {
    view1.addSignalListener('tooltip', (name, data) => {
        console.log('aaap', data);
        if (R.isNil(data.category) === false) {
            const i = R.findIndex(c => c === R.toUpper(data.category))(alphabet);
            const newHighlightedPoint = {
                category: i + 1,
                amount: data.amount,
            };
            console.log(newHighlightedPoint);
            view2
            .change('highlightedPoint',
                vega.changeset()
                .insert([newHighlightedPoint])
                .remove(highlightedPoint),
            )
            .run();
            highlightedPoint = newHighlightedPoint;
            // console.log(view1.getState().signals.tooltip);
            view2.signal('tooltip', newHighlightedPoint).run();
        } else {
            view2
            .change('highlightedPoint',
                vega.changeset()
                .remove(highlightedPoint),
            )
            .run();
            view2.signal('tooltip', highlightedPoint).run();
        }
    });
    // view1.signal('tooltip', []).run();
    // console.log(view1);
    view2.signal('tooltip', view1.data('table')[2]).run();
    // const p = view2.signal('height', 14).run();
    // console.log(p);
    // const state = view1.getState();
    // console.log(state);
    // view1.setState({
    //     ...state,
    //     signals: {
    //         ...state.signals,
    //         tooltip: [{ category: 'B', amount: 55, _id: 3 }],
    //     },
    // })
    // .run();
});

