import {strict as assert} from "node:assert"
import {createRequire} from "node:module"
import {test} from "node:test"

const require = createRequire(import.meta.url)

test("require entry (.cjs)", () => {
    const m = require("html-slim")
    assert.equal(typeof m.slim, "function")
})

test("minified entry (.min.js)", () => {
    const cjs = require.resolve("html-slim")
    const m = require(cjs.replace(/\.cjs$/, ".min.js"))
    assert.equal(typeof m.slim, "function")
})
