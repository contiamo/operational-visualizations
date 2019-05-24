# Operational Visualizations [![Build Status](https://travis-ci.com/contiamo/operational-visualizations.svg?branch=master)](https://travis-ci.com/contiamo/operational-visualizations) [![Netlify Status](https://api.netlify.com/api/v1/badges/37ca92a3-60e8-428e-a7ff-91666b59b4a8/deploy-status)](https://app.netlify.com/sites/operational-visualizations/deploys)

## Getting Started

This project is structured as a [monorepo](https://www.atlassian.com/git/tutorials/monorepos) for operational visualizations and related libraries. It consists of three libraries:

- [`@operational/frame`](packages/frame) - representation of multidimensional data.
- [`@operational/visualizations`](packages/visualizations) - set of visualisations primitives for building visualisations, React library. Uses frame as data source.
- [`@operational/grid`](packages/grid) - React component pivot table. Uses frame as data source. You can use `grid` together with `visualizations` to show visualisations in cells of pivot table.

## Running locally

```
yarn
yarn build
yarn start
```

to run tests

```
yarn test --watch
```

Open http://localhost:8080/

## Building for Production

```
yarn build
```

## Monorepo problems

- ⚠️ typescript errors don't show up in the browser, but show up in the terminal among listo of other messages it is really hard to spot it, so developer can be frustrated why changes don't apply. On the bright side type errors show up in `yarn test --watch`
- 😞️ `lint-ts` errors doesn't show up in the browser, but show up when you try to commit, which is very annoying
- 😞 [Jest doesn't support ES modules](https://github.com/facebook/jest/issues/4842), so we need to compile all modules down to ES5 and CommonJS.
- In order to start storybook you need to run `yarn build` once, so it would have sub-packages ready, after it can watch for file changes.
- In order to run tests you need to run `yarn build` once, so it would have sub-packages ready, after it can watch for file changes.
- build script relies on order of packages e.g. `frame` supposed to be built first, `visualizations-stories` supposed to be built last.
