import {render} from "dom-serializer"
import type {Document, Element} from "domhandler"
import {ElementType, parseDocument} from "htmlparser2"
import type * as declared from "../types/html-slim.js";

export const slim: typeof declared.slim = (html, options = {}) => {
    const tagIdx: Record<string, boolean> = {};
    const attrIdx: Record<string, boolean> = {};
    const removeLdJson = !!options.ldJson
    const removeComment = (options.comment !== false)
    const tagRE = options.tag
    const attrRE = options.attr

    const removeScript = tagIdx.script = (options.script !== false)
    const eventRE = removeScript && /^on\w+$/i;
    const removeStyle = tagIdx.style = attrIdx.style = (options.style !== false)
    tagIdx.template = (options.template !== false)
    const stylesheetRE = removeStyle && /^stylesheet$/i;

    const doc = parseDocument(html)
    slimNode(doc);
    return render(doc)

    function slimAttr(node: Element) {
        const {attribs} = node
        Object.keys(attribs).forEach(key => {
            if (attrIdx[key] || (eventRE && eventRE.test(key)) || (attrRE && attrRE.test(key))) {
                delete attribs[key];
            }
        })
    }

    function slimNode(node: Element | Document): void {
        const {children} = node
        const length = children?.length || 0
        for (let i = length - 1; i >= 0; i--) {
            const child = children[i];

            const isLdJson = (child.type === ElementType.Script &&
                child.attribs.type?.split(";")[0]?.toLowerCase() === "application/ld+json")

            if ((removeScript && child.type === ElementType.Script && !isLdJson) ||
                (removeLdJson && isLdJson) ||
                (removeStyle && child.type === ElementType.Style) ||
                (removeComment && child.type === ElementType.Comment)) {
                children.splice(i, 1);
            } else if (child.type === ElementType.Tag) {
                const tagName = (child as Element).tagName
                if (tagIdx[tagName] ||
                    (tagRE && tagRE.test(tagName)) ||
                    (stylesheetRE && tagName === "link" && stylesheetRE.test(child.attribs.rel))) {
                    children.splice(i, 1);
                } else {
                    slimNode(child); // recursive call
                }
            }
        }

        if ((node as Element).attribs) {
            slimAttr(node as Element)
        }
    }
}
