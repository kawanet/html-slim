import type {Document, Element} from "domhandler";

export namespace Slim {
    interface Options {
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

        /**
         * Return true for elements to be deleted
         */
        select?: (node: Element) => boolean | void;
    }
}

/**
 * Strip out scripts, styles and comments from an HTML string.
 */
export const slim: (options?: Slim.Options) => (html: string) => string;
