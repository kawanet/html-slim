import alias from "@rollup/plugin-alias"
import commonjs from "@rollup/plugin-commonjs"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import {fileURLToPath} from "node:url"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../src/*.test.ts",

    output: {
        file: "../browser/tests/bundled.js",
        format: "iife",
    },

    treeshake: false,

    plugins: [
        // Browser-side replacements: each entry's import resolves to the
        // real module under `node --test` and to the local file listed
        // below in the rollup test bundle.
        alias({
            entries: [
                {find: "node:test", replacement: fileURLToPath(new URL("./node-test.shim.ts", import.meta.url))},
                {find: "node:assert", replacement: fileURLToPath(new URL("./node-assert.shim.ts", import.meta.url))},
                {find: "html-slim", replacement: fileURLToPath(new URL("../browser/import.cjs", import.meta.url))},
            ],
        }),

        multiEntry(),

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        // Required so rollup can interpret `browser/import.cjs`'s
        // `exports.slim = slim` syntax. The file stays CJS so browserify
        // users can consume the same glue.
        commonjs(),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
