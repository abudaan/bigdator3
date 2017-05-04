// not in use; this data is loaded over http as a cson of yaml file
export default {
    baseurl: './assets/data/',
    data: 'data.json',
    specs: [
        {
            url: 'view1.vg.json',
            name: 'view1',
            bind: [{
                name: 'view2',
                signals: [
                    'tooltip',
                    'selectedCategory',
                    'dataUpdate',
                ],
            },
            ],
        },
        {
            url: 'view2.vg.json',
            name: 'view2',
            bind: [{
                name: 'view1',
                signals: [
                    'tooltip',
                    'selectedCategory',
                    'dataUpdate',
                ],
            },
            ],
        },
    ],
};
