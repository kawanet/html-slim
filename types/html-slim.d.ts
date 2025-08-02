export namespace Slim {
    export interface Options {
        /**
         * Remove all `<script>` elements, except for `application/ld+json`, and inline event handlers, e.g. onClick=""
         * @default true
         */
        script?: boolean;

        /**
         * Remove `<script type="application/ld+json">` structured data elements
         * @default false
         */
        ldJson?: boolean;

        /**
         * Remove all `<style>` elements and inline `style=""` attributes.
         * @default true
         */
        style?: boolean;

        /**
         * Remove all HTML comments: `<!-- ... -->`
         * @default true
         */
        comment?: boolean;

        /**
         * Remove all <template> elements
         * @default true
         */
        template?: boolean;

        /**
         * RegExp to test elements to be deleted
         * @example /^(next-|nextjs-)$/i
         */
        tag?: { test(name: string): boolean };

        /**
         * RegExp to test attributes to be deleted
         * @example /^data-v-/i
         * @example /^data-rcs$/i
         */
        attr?: { test(name: string): boolean };
    }
}

/**
 * Strip out scripts, styles and comments from an HTML string.
 */
export const slim: (html: string, options?: Slim.Options) => string;
