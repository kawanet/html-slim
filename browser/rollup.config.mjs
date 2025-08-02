import nodeResolve from "@rollup/plugin-node-resolve";

const externals = {"html-slim": "{slim}", "node:test": "{describe, it}", "node:assert": "{strict: assert}"}

export default {
  input: "../src/html-slim.test.js",
  output: {
    file: "../build/test.browser.js",
    format: "iife",
    globals: id => /\/html-slim.js$/.test(id) ? "{slim}" : (externals[id] || id),
  },
  external: id => !!(/\/html-slim.js$/.test(id) || externals[id]),
  plugins: [
    nodeResolve()
  ]
};
