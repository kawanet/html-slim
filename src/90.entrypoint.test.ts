import type * as declared from "html-slim"
import {strict as assert} from "node:assert"
import {test} from "node:test"
import * as m from "./html-slim.ts"

const isNodeJS = "undefined" !== typeof process && !!process?.versions?.node

const createRequire = async (path: string) => {
    const {createRequire} = await import("node:module")
    return createRequire(path)
}

const resolvePath = async (name: string, path: string) => {
    const require = await createRequire(import.meta.url)
    const {join, dirname} = await import("node:path")
    return join(dirname(require.resolve(name)), path)
}

// tsc fails here when a name declared in the published .d.ts is missing
// from the runtime entry -- the surface check derives from the declarations.
const runtime: typeof declared = m
void runtime

test("import entry (.mjs)", () => {
    // entries
    assert.equal(typeof m.slim, "function")
})

// module-sync sends this to the .mjs where require(esm) exists and to the
// minified bundle below Node 20.19.
test("require entry", {skip: !isNodeJS}, async () => {
    const require = await createRequire(import.meta.url)
    const m = require("html-slim")
    // entries
    assert.equal(typeof m.slim, "function")
})

// The exports map publishes no subpath, so reach the bundle by its path.
test("minified entry (.min.js)", {skip: !isNodeJS}, async () => {
    const require = await createRequire(import.meta.url)
    const m = require(await resolvePath("html-slim", "html-slim.min.js"))
    // entries
    assert.equal(typeof m.slim, "function")
})
