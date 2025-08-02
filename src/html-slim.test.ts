import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
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

        it('should remove comments, script tags, style tags, style attributes, and event handlers', () => {
            const expected = '<html><head><title>Test</title></head><body><h1 class="title">Hello World</h1><p>Click me</p></body></html>';
            assert.equal(noSpace(slim(html)), expected)
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
            assert.equal(noSpace(slim(html, {script: false})), expected)
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
            assert.equal(noSpace(slim(html, {style: false})), expected)
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
            assert.equal(noSpace(slim(html, {comment: false})), expected)
        });
    });

    describe('with options.tag', () => {
        // language=HTML
        const html = `
            <div>
                <custom-element>This should be removed</custom-element>
                <span>This should be kept</span>
                <another-one>This also removed</another-one>
            </div>
        `;
        it('should remove elements matching the tag regex', () => {
            const expected = '<div><span>This should be kept</span></div>';
            assert.equal(noSpace(slim(html, {tag: /custom-element|another-one/})), expected)
        });
    });

    describe('with options.attr', () => {
        // language=HTML
        const html = `
            <div data-v-12345="some-value" id="app" class="container">
                <p data-rcs-id="abc">Hello</p>
                <span data-test="no-match">World</span>
            </div>
        `;
        it('should remove attributes matching the attr regex /^data-v-|^data-rcs/', () => {
            const expected = '<div id="app" class="container"><p>Hello</p><span data-test="no-match">World</span></div>';
            assert.equal(noSpace(slim(html, {attr: /^data-v-|^data-rcs/})), expected)
        });
    });

    describe('with options.ldJson', () => {
        // language=HTML
        const html = `
            <div>
                <script>[]</script>
                <script type="application/ld+json">{"@type": "Thing"}</script>
            </div>
        `;

        it('default', () => {
            const expected = '<div><script type="application/ld+json">{"@type": "Thing"}</script></div>';
            assert.equal(noSpace(slim(html)), expected)
        });

        it('with {script: true, ldJson: true}', () => {
            const expected = '<div></div>';
            assert.equal(noSpace(slim(html, {script: true, ldJson: true})), expected)
        });

        it('with {script: true, ldJson: false}', () => {
            const expected = '<div><script type="application/ld+json">{"@type": "Thing"}</script></div>';
            assert.equal(noSpace(slim(html, {script: true, ldJson: false})), expected)
        });

        it('with {script: false, ldJson: true}', () => {
            const expected = '<div><script>[]</script></div>';
            assert.equal(noSpace(slim(html, {script: false, ldJson: true})), expected)
        });

        it('with {script: false, ldJson: false}', () => {
            const expected = '<div><script>[]</script><script type="application/ld+json">{"@type": "Thing"}</script></div>';
            assert.equal(noSpace(slim(html, {script: false, ldJson: false})), expected)
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
            assert.equal(noSpace(slim(html)), expected)
        });

        it('{style: true}', () => {
            const expected = '<head></head>';
            assert.equal(noSpace(slim(html, {style: true})), expected)
        });

        it('{style: false}', () => {
            const expected = '<head><link rel="stylesheet"></head>';
            assert.equal(noSpace(slim(html, {style: false})), expected)
        });
    })
}
