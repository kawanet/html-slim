export namespace Slim {
    interface Options {
        /**
         * Remove all `<script>` elements, except for `application/ld+json`,
         * inline event handlers, e.g. `onClick=""`,
         * as well as `<link rel="preload" as="script">` preload statements.
         * @default false
         */
        script?: boolean;

        /**
         * Remove `<script type="application/ld+json">` structured data elements
         * @default false
         */
        ldJson?: boolean;

        /**
         * Remove all `<style>` elements,
         * inline `style=""` attributes,
         * as well as `<link rel="preload" as="style">` preload statements.
         * @default false
         */
        style?: boolean;

        /**
         * Remove all HTML comments: `<!-- ... -->`
         * @default true
         */
        comment?: boolean;

        /**
         * RegExp to test elements to be deleted
         * @example "^(next-|nextjs-)"
         * @example /^(next-|nextjs-)/i
         */
        tag?: string | { test(name: string): boolean };

        /**
         * RegExp to test attributes to be deleted
         * @example "^(data-v-)"
         * @example /^(data-v-)/i
         */
        attr?: string | { test(name: string): boolean };

        /**
         * CSS selector to test elements to be deleted
         * @example "body > header, body > footer"
         */
        selector?: string;

        /**
         * Collapse consecutive whitespaces into a single.
         * Set to `false` to preserve the original whitespace.
         * @default true
         */
        space?: boolean;
    }
}

/**
 * Strip out scripts, styles and comments from an HTML string.
 */
export const slim: (options?: Slim.Options) => (html: string) => string;
