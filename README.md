# html-slim

[![Node.js CI](https://github.com/kawanet/html-slim/workflows/Node.js%20CI/badge.svg?branch=main)](https://github.com/kawanet/html-slim/actions/)
[![npm version](https://img.shields.io/npm/v/html-slim)](https://www.npmjs.com/package/html-slim)
[![gzip size](https://img.badgesize.io/https://unpkg.com/html-slim/dist/html-slim.min.js?compression=gzip)](https://unpkg.com/html-slim/dist/html-slim.min.js)

A utility to slim down HTML by removing unnecessary tags and attributes.

## SYNOPSIS

```js
import {slim} from "html-slim";

const slimFn = slim()

const compactHtml = slimFn(originalHtml);
```

## OPTIONS

```js
const slimFn = slim({
  script: true,
  ldJson: false,
  style: true,
  comment: true,
  template: true,
  tag: /^(next-|nextjs-)$/,
  attr: /^data-v-/,
});

const compactHtml = slimFn(originalHtml);
```

## COMMONJS

```js
const {slim} = require("html-slim");
```

## TYPESCRIPT

See TypeScript declaration [index.d.ts](https://github.com/kawanet/html-slim/blob/main/types/html-slim.d.ts) for detail.

## LINKS

- https://github.com/kawanet/html-slim
- https://www.npmjs.com/package/html-slim
