import {strict as assert} from "node:assert";
import {describe, it} from "node:test";
import {slim} from "./html-slim.js";

const noSpace = (html: string) => html
    .replace(/>\s*(\n)\s*</g, ">$1<")
    .replace(/^\s+(<)/mg, "$1")
    .replace(/^\s*\n/, "")
    .replace(/ +$/, "");

{
    describe('options.script: boolean', () => {
        // language=HTML
        const html = `
            <p style="color: blue;" onclick="alert(true)">Some text</p>
            <script>
                alert('kept');
            </script>
            <style>
                p {
                    display: none;
                }
            </style>
        `;

        // language=HTML
        const slimmed = `
            <p style="color: blue;">Some text</p>
            <style>
                p {
                    display: none;
                }
            </style>
        `.trimStart().replace(/^ +(<|$)/mg, "$1");

        it('default', () => {
            assert.equal(slim({script: false})(html), noSpace(html))
        });

        it('{script: true}', () => {
            assert.equal(slim({script: true})(html), slimmed)
        });

        it('{script: false}', () => {
            assert.equal(slim({script: false})(html), noSpace(html))
        });
    });

    describe('options.style: boolean', () => {
        // language=HTML
        const html = `
            <p style="color: blue;" onclick="alert(true)">Some text</p>
            <script>
                alert('removed');
            </script>
            <style>
                p {
                    display: block;
                }
            </style>
        `;

        // language=HTML
        const slimmed = `
            <p onclick="alert(true)">Some text</p>
            <script>
                alert('removed');
            </script>
        `.trimStart().replace(/^ +(<|$)/mg, "$1");

        it('default', () => {
            assert.equal(slim()(html), noSpace(html))
        })

        it('{style: true}', () => {
            assert.equal(slim({style: true})(html), slimmed)
        })

        it('{style: false}', () => {
            assert.equal(slim({style: false})(html), noSpace(html))
        })
    })

    describe('options.comment: boolean', () => {
        // language=HTML
        const html = `
            <!-- this is the first comment -->
            <p>Some text</p>
            <!-- this is the last comment -->
        `;

        it('default', () => {
            const expected = '<p>Some text</p>\n';
            assert.equal(slim()(html), expected)
        });

        it('{comment: true}', () => {
            const expected = '<p>Some text</p>\n';
            assert.equal(slim({comment: true})(html), expected)
        });

        it('{comment: false}', () => {
            const expected = noSpace(html)
            assert.equal(slim({comment: false})(html), expected)
        });
    });

    describe('options.tag: RegExp, select: string', () => {
        // language=HTML
        const html = `
            <div>
                <custom-element>This should be removed</custom-element>
                <span>This should be kept</span>
                <another-one>This also removed</another-one>
            </div>
        `;

        const expected = '<div>\n<span>This should be kept</span>\n</div>\n';

        it('{tag: /regexp/}', () => {
            assert.equal(slim({tag: /^(custom-element|another-one)$/})(html), expected)
        });

        it('{select: "selector"}', () => {
            assert.equal(slim({select: "custom-element, another-one"})(html), expected)
        });
    });

    describe('options.attr: RegExp', () => {
        // language=HTML
        const html = `
            <div data-v-12345="some-value" id="app" class="container">
                <p data-rcs-id="abc">Hello</p>
                <span data-test="no-match">World</span>
            </div>
        `;

        it('{attr: /regexp/}', () => {
            const expected = '<div id="app" class="container">\n<p>Hello</p>\n<span data-test="no-match">World</span>\n</div>\n';
            assert.equal(slim({attr: /^data-v-|^data-rcs/})(html), expected)
        });
    });

    describe('options.ldJson: boolean', () => {
        // language=HTML
        const html = `
            <div>
                <script>[]</script>
                <script type="application/ld+json">{"@type": "Thing"}</script>
            </div>
        `;

        it('default', () => {
            const expected = noSpace(html)
            assert.equal(slim()(html), expected)
        });

        it('with {script: true, ldJson: true}', () => {
            const expected = '<div>\n</div>\n';
            assert.equal(slim({script: true, ldJson: true})(html), expected)
        });

        it('with {script: true, ldJson: false}', () => {
            const expected = '<div>\n<script type="application/ld+json">{"@type": "Thing"}</script>\n</div>\n';
            assert.equal(slim({script: true, ldJson: false})(html), expected)
        });

        it('with {script: false, ldJson: true}', () => {
            const expected = '<div>\n<script>[]</script>\n</div>\n';
            assert.equal(slim({script: false, ldJson: true})(html), expected)
        });

        it('with {script: false, ldJson: false}', () => {
            const expected = noSpace(html)
            assert.equal(slim({script: false, ldJson: false})(html), expected)
        });
    });

    describe('<link rel="stylesheet">', () => {
        // language=HTML
        const html = `
            <head>
                <link rel="stylesheet" href="style.css">
            </head>
        `

        it('default', () => {
            const expected = noSpace(html)
            assert.equal(slim()(html), expected)
        });

        it('{style: true}', () => {
            const expected = '<head>\n</head>\n';
            assert.equal(slim({style: true})(html), expected)
        });

        it('{style: false}', () => {
            const expected = noSpace(html)
            assert.equal(slim({style: false})(html), expected)
        });
    })

    describe('<link rel="preload">', () => {
        // language=HTML
        const html = `
            <head>
                <link rel="preload" href="style.css" as="style">
                <link rel="preload" href="main.js" as="script">
            </head>
        `

        it('default', () => {
            const expected = noSpace(html)
            assert.equal(slim()(html), expected)
        });

        it('{style: true, script: true}', () => {
            const expected = '<head>\n</head>\n';
            assert.equal(slim({style: true, script: true})(html), expected)
        });

        it('{style: true, script: false}', () => {
            const expected = '<head>\n<link rel="preload" href="main.js" as="script">\n</head>\n';
            assert.equal(slim({style: true, script: false})(html), expected)
        });

        it('{style: false, script: true}', () => {
            const expected = '<head>\n<link rel="preload" href="style.css" as="style">\n</head>\n';
            assert.equal(slim({style: false, script: true})(html), expected)
        });

        it('{style: false, script: false}', () => {
            const expected = noSpace(html)
            assert.equal(slim({style: false, script: false})(html), expected)
        });
    });

    describe('options.select: string', () => {
        // language=HTML
        const html = `
            <body>
            <header>Foo</header>
            <main>
                <header>Bar</header>
            </main>
            </body>
        `;

        it('header', () => {
            const expected = `<body>\n<main>\n</main>\n</body>\n`;
            assert.equal(slim({select: "header"})(html), expected)
        });

        it('body > header', () => {
            const expected = `<body>\n<main>\n<header>Bar</header>\n</main>\n</body>\n`;
            assert.equal(slim({select: "body > header"})(html), expected)
        });

        it('main > header', () => {
            const expected = `<body>\n<header>Foo</header>\n<main>\n</main>\n</body>\n`;
            assert.equal(slim({select: "main > header"})(html), expected)
        });
    });

    describe('options.space: boolean', () => {
        // language=HTML
        const html = `
            <ul>
                <li>first</li>
                <li>
                    second
                </li>
                <li></li>
            </ul>
        `;

        it('default', () => {
            const expected = `<ul>\n<li>first</li>\n<li>\nsecond\n</li>\n<li></li>\n</ul>\n`;
            assert.equal(slim()(html), expected)
        });

        it('{space: true}', () => {
            const expected = `<ul>\n<li>first</li>\n<li>\nsecond\n</li>\n<li></li>\n</ul>\n`;
            assert.equal(slim({space: true})(html), expected)
        });

        it('{space: false}', () => {
            assert.equal(slim({space: false})(html), html)
        });
    });
}
