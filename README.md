# Operational Visualizations [![Build Status](https://travis-ci.com/contiamo/operational-visualizations.svg?branch=master)](https://travis-ci.com/contiamo/operational-visualizations) [![Netlify Status](https://api.netlify.com/api/v1/badges/37ca92a3-60e8-428e-a7ff-91666b59b4a8/deploy-status)](https://app.netlify.com/sites/operational-visualizations/deploys)

> This is a development branch for the latest version of `@operational/visualizations` (v7 or later). If you are looking for source code of v6 or earlier see [master-v6](https://github.com/contiamo/operational-visualizations/tree/master-v6) branch. Documentation for v6 is [here](https://contiamo.github.io/operational-visualizations).

## Getting Started

This project is structured as a [monorepo](https://www.atlassian.com/git/tutorials/monorepos) for operational visualizations and related libraries. It consists of three libraries:

- [`@operational/frame`](packages/frame) - representation of multidimensional data.
- [`@operational/visualizations`](packages/visualizations) - set of visualisations primitives for building visualisations, React library. Uses frame as data source.
- [`@operational/grid`](packages/grid) - React component pivot table. Uses frame as data source. You can use `grid` together with `visualizations` to show visualisations in cells of pivot table.

## Running locally

```
yarn
yarn start
```

to run tests

```
yarn test --watch
```

Open http://localhost:7000/

## Building for Production

```
yarn build
```
