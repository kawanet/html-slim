import type {Document} from "domhandler";
import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {slim} from "./html-slim.js";

const noSpace = (html: string) => html.replace(/\s+(<|$)|(^|>)\s+/mg, "$1$2").replace(/([ \t])[ \t]+|\r?(\n)[\r\n]+/g, "$1$2")

{
    describe('default options', () => {
        // language=HTML
        const html = `
            <!-- this is a comment -->
            <html>
            <head>
                <title>Test</title>
                <style>body {
                    color: red;
                }</style>
                <script>alert('hello');</script>
            </head>
            <body style="margin: 0;" onload="init()">
            <h1 class="title">Hello World</h1>
            <p onclick="doSomething()">Click me</p>
            <script>console.log('inline script');</script>
            </body>
            </html>
        `;

        const expected = '<html><head><title>Test</title></head><body><h1 class="title">Hello World</h1><p>Click me</p></body></html>';

        it('slim()(html)', () => {
            assert.equal(noSpace(slim()(html)), expected)
        });
    });

    describe('with options.script: false', () => {
        // language=HTML
        const html = `
            <p>Some text</p>
            <script>alert('kept');</script>
            <style>
                p {
                    display: none;
                }
            </style>
        `;
        it('should keep script tags but remove style tags and attributes', () => {
            const expected = '<p>Some text</p><script>alert(\'kept\');</script>';
            assert.equal(noSpace(slim({script: false})(html)), expected)
        });
    });

    describe('with options.style: false', () => {
        // language=HTML
        const html = `
            <p style="color: blue;" onclick="alert('hello')">Some text</p>
            <script>alert('removed');</script>
            <style>
                p {
                    display: block;
                }
            </style>
        `;

        it('should keep style tags, style attributes, and event handlers, but remove script tags', () => {
            const expected = '<p style="color: blue;">Some text</p><style>p {\ndisplay: block;\n}</style>';
            assert.equal(noSpace(slim({style: false})(html)), expected)
        })
    })

    describe('with options.comment: false', () => {
        // language=HTML
        const html = `
            <!-- this is a comment -->
            <p>Some text</p>
            <script>alert('removed');</script>
        `;
        it('should keep comments but remove script tags', () => {
            const expected = '<!-- this is a comment --><p>Some text</p>';
            assert.equal(noSpace(slim({comment: false})(html)), expected)
        });
    });

    describe('with options.tag RegExp and walk Function', () => {
        // language=HTML
        const html = `
            <div>
                <custom-element>This should be removed</custom-element>
                <span>This should be kept</span>
                <another-one>This also removed</another-one>
            </div>
        `;

        const expected = '<div><span>This should be kept</span></div>';

        it('{tag: /regexp/}', () => {
            assert.equal(noSpace(slim({tag: /custom-element|another-one/})(html)), expected)
        });

        it('{walk(){...}}', () => {
            assert.equal(noSpace(slim({
                walk(node) {
                    return /custom-element|another-one/.test(node.tagName)
                }
            })(html)), expected)
        });
    });

    describe('with options.attr RegExp', () => {
        // language=HTML
        const html = `
            <div data-v-12345="some-value" id="app" class="container">
                <p data-rcs-id="abc">Hello</p>
                <span data-test="no-match">World</span>
            </div>
        `;

        it('{attr: /regexp/}', () => {
            const expected = '<div id="app" class="container"><p>Hello</p><span data-test="no-match">World</span></div>';
            assert.equal(noSpace(slim({attr: /^data-v-|^data-rcs/})(html)), expected)
        });
    });

    describe('with options.ldJson: boolean', () => {
        // language=HTML
        const html = `
            <div>
                <script>[]</script>
                <script type="application/ld+json">{"@type": "Thing"}</script>
            </div>
        `;

        it('default', () => {
            const expected = '<div><script type="application/ld+json">{"@type": "Thing"}</script></div>';
            assert.equal(noSpace(slim()(html)), expected)
        });

        it('with {script: true, ldJson: true}', () => {
            const expected = '<div></div>';
            assert.equal(noSpace(slim({script: true, ldJson: true})(html)), expected)
        });

        it('with {script: true, ldJson: false}', () => {
            const expected = '<div><script type="application/ld+json">{"@type": "Thing"}</script></div>';
            assert.equal(noSpace(slim({script: true, ldJson: false})(html)), expected)
        });

        it('with {script: false, ldJson: true}', () => {
            const expected = '<div><script>[]</script></div>';
            assert.equal(noSpace(slim({script: false, ldJson: true})(html)), expected)
        });

        it('with {script: false, ldJson: false}', () => {
            const expected = '<div><script>[]</script><script type="application/ld+json">{"@type": "Thing"}</script></div>';
            assert.equal(noSpace(slim({script: false, ldJson: false})(html)), expected)
        });
    });

    describe('<link rel="stylesheet">', () => {
        // language=HTML
        const html = `
            <head>
                <link rel="stylesheet"/>
            </head>
        `

        it('default', () => {
            const expected = '<head></head>';
            assert.equal(noSpace(slim()(html)), expected)
        });

        it('{style: true}', () => {
            const expected = '<head></head>';
            assert.equal(noSpace(slim({style: true})(html)), expected)
        });

        it('{style: false}', () => {
            const expected = '<head><link rel="stylesheet"></head>';
            assert.equal(noSpace(slim({style: false})(html)), expected)
        });
    })

    describe('<link rel="preload">', () => {
        // language=HTML
        const html = `
            <head>
                <link rel="preload" href="style.css" as="style"/>
                <link rel="preload" href="main.js" as="script"/>
            </head>
        `

        it('default', () => {
            const expected = '<head></head>';
            assert.equal(noSpace(slim()(html)), expected)
        });

        it('{style: true, script: true}', () => {
            const expected = '<head></head>';
            assert.equal(noSpace(slim({style: true, script: true})(html)), expected)
        });

        it('{style: true, script: false}', () => {
            const expected = '<head><link rel="preload" href="main.js" as="script"></head>';
            assert.equal(noSpace(slim({style: true, script: false})(html)), expected)
        });

        it('{style: false, script: true}', () => {
            const expected = '<head><link rel="preload" href="style.css" as="style"></head>';
            assert.equal(noSpace(slim({style: false, script: true})(html)), expected)
        });

        it('{style: false, script: false}', () => {
            const expected = '<head><link rel="preload" href="style.css" as="style"><link rel="preload" href="main.js" as="script"></head>';
            assert.equal(noSpace(slim({style: false, script: false})(html)), expected)
        });
    });

    describe('with options.root', () => {
        // language=HTML
        const html = `
            <html></html>
        `;

        it('{root: (doc) => void}', () => {
            const docs: Document[] = [];
            const result = slim({root: doc => docs.push(doc)})(html)
            const expected = '<html></html>';
            assert.equal(noSpace(result), expected);
            assert.equal(docs.length, 1);
            assert.equal(docs[0].nodeType, 9);
            assert.equal(docs[0].type, "root");
        });
    });
}
