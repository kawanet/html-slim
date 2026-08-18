import {builtinModules} from "node:module"

// `dependencies` and Node builtins are resolved at runtime by the
// consumer — never bundle them. Cover both bare and `node:` prefixed
// forms so the result does not depend on which form a source uses.
// Includes the package's own name so its self-reference stays external.
//
// `domhandler` is deliberately absent: it is a devDependency used only
// through `import type`, so it never reaches the output. Were a value
// import added, bundling it would trip the byte cap — the signal we want.
const externals = new Set<string>([
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    "css-select",
    "dom-serializer",
    "htmlparser2",
    "html-slim",
])

export const isExternal = (id: string): boolean => externals.has(id)
