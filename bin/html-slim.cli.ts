#!/usr/bin/env node

import {parseArgs, ParseArgsOptionDescriptor, ParseArgsOptionsConfig} from "node:util";
import {slim} from "../src/html-slim.js";
import type {Slim} from "../types/html-slim.js";

async function readStdin() {
    const chunks: string[] = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }
    return chunks.join("");
}

;(async () => {
    const B = {type: "boolean"} as const;
    const S = {type: "string"} as const;

    const config: Record<Partial<keyof Slim.Options>, ParseArgsOptionDescriptor> = {
        script: B,
        ldJson: B,
        style: B,
        comment: B,
        tag: S,
        attr: S,
        selector: S,
        space: B,
    }

    const options: ParseArgsOptionsConfig = {}

    Object.keys(config).forEach(key => {
        const desc = config[key as keyof typeof config];
        options[key] = desc;
        if (desc.type === "boolean") {
            options[`no-${key}`] = desc;
        }
        const lower = key.toLowerCase();
        if (key !== lower) {
            options[lower] = desc;
        }
    });

    const {values} = parseArgs({options});

    const params: Slim.Options = values;

    if (values.ldjson != null) {
        params.ldJson = !!values.ldjson;
        delete (params as any).ldjson;
    }

    if (values.tag) {
        params.tag = new RegExp(values.tag as string, "ig");
    }

    if (values.attr) {
        params.attr = new RegExp(values.attr as string, "ig");
    }

    Object.keys(values).forEach(key => {
        const name = key.replace(/^no-/, "");
        if (name !== key) {
            const desc = options[key];
            if (desc?.type === "boolean") {
                type BooleanKeys<T> = { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T];
                params[name as BooleanKeys<typeof params>] = !values[key];
                delete values[key];
            }
        }
    })

    const slimFn = slim(params)

    const input = await readStdin();

    const result = slimFn(input);

    process.stdout.write(result);
})();
