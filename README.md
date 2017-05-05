## Setting up interaction between Vega3 views in separate div elements

### The problem
While it is possible to have interaction between multiple Vega data representations as you can see in  this [example](https://vega.github.io/vega/examples/crossfilter-flights/), all representations have to live in the same Vega spec and thus in the same HTML element. To achieve interaction between Vega data representations that live in separate specs and HTML elements we need to create an extra runtime layer that takes care of this.

### The solution
This project shows a possible solution for this problem; the runtime layer maps the Vega signals that are defined in the discrete specs to one and each other. This mapping can be configured in a simple yaml config file.

### How it works
In runtime you can add signal listeners to your Vega views and pass the signal values on to signals in other views. Here we see a hard-coded signal mapping between the signal `tooltip` of view1 and the signal `information` of view2:
```javascript
    view1.addSignalListener('tooltip', data) => {
        view2.signal('information', data).run();
    });
```
What this does is setting the value of `information` in view2 to the value of `tooltip` every time this value changes in view1. Although this works perfectly well, it isn't very flexible.

If you take a look at the [yaml config file](https://github.com/abudaan/bigdator3/blob/master/assets/data/config.yaml) you see that it starts with a url to the dataset that is used in the specs of this application. Because this project is still a proof of concept you currently you can only add one dataset. The dataset is loaded first.

The config also describes which specs have to be loaded. After a spec is loaded a div is created for this spec and the div is added to the HTML page. The id of this div is set to the name of the spec. The spec will be initialized using the dataset that was loaded in the previous step.

In the `bind` array of every spec you can specify per spec which signal of which spec should be mapped:
```yaml
specs:
    - url: view1.vg.json # load this spec
      name: view1 # listener
      bind:
        - name: view2 # emitter 1
          signals:
            # this tuple tells us that signal `info` of view2 should
            # be mapped to signal `tooltip` of view1
            - [info, tooltip]
            # if you map signals that have the same name in both listener
            # and emitter you can specify only that name
            - selectedCategory

        - name: view3 # emitter 2
          signals:
            - [hover, highlight]

        - name: view4 # emitter 3
          signals:
            - [hover, highlight]
```


### Installation and running the project

You need to have git, nodejs and yarn (or npm) installed on your computer.

- clone the repository
- `yarn install` (or `npm install`)
- `yarn start` (or `npm start`)

The `yarn start` command will build the necessary js and css files and start a server on `http://localhost:5003`. If you don't want to go through all the hassle of installing, here is the [live version](http://app3.bigdator.nl).