import commonjs from "@rollup/plugin-commonjs"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import terser from "@rollup/plugin-terser"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../src/html-slim.ts",

    // No `external` here, unlike the .mjs/.cjs configs: nothing resolves
    // node_modules in a browser, so `dependencies` must be inlined.
    output: {
        file: "../dist/html-slim.min.js",
        format: "iife",
        name: "slim",
        exports: "named",
        // The IIFE's auto-`return exports;` would yield
        // `var slim = {slim: <fn>}` (a namespace global). Override with an
        // early `return exports.slim;` so the global is `var slim = <fn>`
        // (callable directly). The leading `module.exports = exports` makes
        // the same bundle usable as a CJS module, matching the named-export
        // shape published by `dist/html-slim.cjs`. Rollup's auto-return
        // becomes unreachable and terser drops it.
        outro: "if (typeof module !== 'undefined') { module.exports = exports }\nreturn exports.slim;",
    },

    plugins: [
        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        // htmlparser2 and its transitive deps ship CJS entry points.
        commonjs(),

        sucrase({
            disableESTransforms: true,
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),

        terser({
            compress: true,
            ecma: 2020,
            mangle: true,
        }),
    ],
}

export default rollupConfig
