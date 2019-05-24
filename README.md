# Operational Visualizations [![Build Status](https://travis-ci.com/contiamo/operational-visualizations.svg?branch=master)](https://travis-ci.com/contiamo/operational-visualizations) [![Netlify Status](https://api.netlify.com/api/v1/badges/37ca92a3-60e8-428e-a7ff-91666b59b4a8/deploy-status)](https://app.netlify.com/sites/operational-visualizations/deploys)

## Getting Started

This is [monorepo](https://www.atlassian.com/git/tutorials/monorepos) for operational visualizations and related libraries. It consists of three libraries:

- [`frame`](packages/frame) - representation of multidimensional data.
- [`visualizations`](packages/visualizations) - set of visualisations primitives for building visualisations, React library. Uses frame as data source.
- [`grid`](packages/grid) - React component pivot table. Uses frame as data source. You can use `grid` together with `visualizations` to show visualisations in cells of pivot table.

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
