import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {Plugin, RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

// Whether the source shebang survives the pipeline depends on unrelated
// details (sucrase eats it with the leading trivia of an elided type-only
// import). Strip it always, and let output.banner supply exactly one.
const stripShebang = (): Plugin => ({
    name: "strip-shebang",
    transform: (code) => code.replace(/^#![^\n]*/, ""),
})

const rollupConfig: RollupOptions = {
    input: "../bin/html-slim.cli.ts",

    // The CLI must stay outside dist/, whose package.json (a commonjs
    // marker for the minified bundle) breaks self-reference resolution.
    output: {
        file: "../bin/html-slim.cli.js",
        format: "esm",
        // npm exposes bin entries as symlinks on POSIX, so the target
        // itself must carry the shebang to be executable from PATH.
        banner: "#!/usr/bin/env node",
    },

    // The library itself is external here, so the CLI resolves it through
    // the package `exports` at runtime — the same path a consumer takes.
    // Bare specifiers stay external; only relative paths are bundled.
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

        stripShebang(),

        showFiles(),
    ],
}

export default rollupConfig
