## Setting up interaction between Vega3 views in separate div elements

### The problem
While it is possible to have interaction between multiple Vega data representations as you can see in  this [example](https://vega.github.io/vega/examples/crossfilter-flights/), all representations have to live in the same Vega spec and thus in the same HTML element. To achive interaction between Vega data representations that live in separate specs we need to create an extra runtime layer that interconnects Vega signals.

### The solution
This project show a possible solution for this problem.


### Installation and running the project

You need to have git, nodejs and npm or yarn installed on your computer.

- `git clone git@github.com:abudaan/bigdator3`
- `yarn install` (or `npm install`)
- `yarn start` (or `npm start`)

The `yarn start` command will build the necessary js and css files and start a server on `http://localhost:5003`.

If you don't want to go through all the hassle of installing here is a [live example](http://app3.bigdator.nl).