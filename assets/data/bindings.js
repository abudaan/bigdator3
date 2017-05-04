export default {
    baseurl: '/assets/data/',
    data: 'data.json',
    specs: [
        {
            url: 'vega1.vg.json',
            name: 'vega1',
            bind: [{
                name: 'vega2',
                signals: [
                    'tooltip',
                 // 'selectedCategory',
                    'dataUpdate',
                ],
            },
            ],
        },
        {
            url: 'vega2.vg.json',
            name: 'vega2',
            bind: [{
                name: 'vega1',
                signals: [
                // 'tooltip',
                // 'selectedCategory',
                // 'dataUpdate',
                ],
            },
            ],
        },
    ],
};
