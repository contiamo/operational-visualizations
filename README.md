# Operational Visualizations [![Build Status](https://travis-ci.com/contiamo/operational-visualizations.svg?branch=master)](https://travis-ci.com/contiamo/operational-visualizations) [![Netlify Status](https://api.netlify.com/api/v1/badges/37ca92a3-60e8-428e-a7ff-91666b59b4a8/deploy-status)](https://app.netlify.com/sites/operational-visualizations/deploys)

The `@operational/visualizations` package contains simple, stateless UI building blocks - your typical input fields, buttons, cards, grids, and so on. See [demo and docs](https://operational-visualizations.netlify.com/).

## Getting Started

Install the package via npm or yarn:

`npm install @operational/visualizations`

Create your first application like so:

```js
iimport { Chart } from "@operational/visualizations";

const container = document.getElementById("chart");
const viz = new Chart(container);
viz.data(createData([/* ... */]));
viz.draw();
```

## Running locally

```
yarn
yarn start
```

Open http://localhost:8080/

## Building for Production

```
yarn build
```
