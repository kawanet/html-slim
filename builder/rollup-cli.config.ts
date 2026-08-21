import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../bin/html-slim.cli.ts",

    output: {
        file: "../bin/html-slim.cli.js",
        format: "esm",
    },

    // The library itself is external here, so the CLI resolves it through
    // the package `exports` at runtime — the same path a consumer takes.
    external: /^[^.\/]/,

    plugins: [
        nodeResolve({
            extensions: [".ts", ".js"],
            preferBuiltins: true,
        }),

        sucrase({
            disableESTransforms: true,
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
