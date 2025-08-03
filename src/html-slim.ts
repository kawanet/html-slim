import {compile} from "css-select";
import {render} from "dom-serializer"
import type {Comment, Element, Node, NodeWithChildren, Text} from "domhandler"
import {parseDocument} from "htmlparser2"
import type * as declared from "../types/html-slim.js";

const isElement = (node: Node): node is Element => (node.nodeType === 1);
const isText = (node: Node): node is Text => (node.nodeType === 3);
const isComment = (node: Node): node is Comment => (node.nodeType === 8);
const isNodeWithChildren = (node: Node): node is NodeWithChildren => (!!(node as NodeWithChildren).children);

const isLink = (node: Element): boolean => (node.name === "link");
const isPreload = (node: Element): boolean => (isLink(node) && node.attribs.rel?.toLowerCase() === "preload");

const isScript = (node: Element): boolean => (node.name === "script");
const isLdJson = (node: Element): boolean => (node.attribs.type?.split(";")[0]?.toLowerCase() === "application/ld+json");
const isPreloadScript = (node: Element): boolean => (isPreload(node) && node.attribs.as?.toLowerCase() === "script");

const isStyle = (node: Element): boolean => (node.name === "style");
const isLinkStylesheet = (node: Element): boolean => (isLink(node) && node.attribs.rel?.toLowerCase() === "stylesheet");
const isPreloadStyle = (node: Element): boolean => (isPreload(node) && node.attribs.as?.toLowerCase() === "style");

const keepSpace: Record<string, 1> = {
    pre: 1,
    script: 1,
    style: 1,
    textarea: 1,
};

export const slim: typeof declared.slim = ((options = {}) => {
    const attrIdx: Record<string, boolean> = {};
    const removeLdJson = !!options.ldJson
    const removeComment = (options.comment !== false)
    const tagRE = options.tag
    const attrRE = options.attr
    const removeScript = !!options.script
    const eventRE = removeScript && /^on\w+$/i;
    const removeStyle = attrIdx.style = !!options.style
    const select = options.select;
    const selectFn = select && compile(select)
    const removeSpace = (options.space !== false)

    return (input) => {
        const doc = parseDocument(input);
        slimNode(doc);

        if (removeSpace) {
            const first = doc.children[0]
            if (first && isText(first)) {
                first.data = first.data.replace(/^\s*\n/, "")
            }
        }

        return render(doc);
    }

    function slimAttr(node: Element) {
        const {attribs} = node

        Object.keys(attribs).forEach(key => {
            if (attrIdx[key] || (eventRE && eventRE.test(key)) || (attrRE && attrRE.test(key))) {
                delete attribs[key];
            }
        })
    }

    function slimNode(node: NodeWithChildren): void {
        const {children} = node

        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];

            if ((isElement(child) &&
                    ((selectFn && selectFn(child)) ||
                        (tagRE && tagRE.test(child.tagName)) ||
                        (isScript(child) && (isLdJson(child) ? removeLdJson : removeScript)) ||
                        (removeScript && isPreloadScript(child)) ||
                        (removeStyle && (isStyle(child) || isLinkStylesheet(child) || isPreloadStyle(child))))) ||
                (removeComment && isComment(child))) {
                children.splice(i++, 1);
            } else if (isNodeWithChildren(child)) {
                slimNode(child); // recursive call
            } else if (removeSpace && isText(child)) {
                const next = children[i + 1]
                if (next && isText(next)) {
                    child.data = next.data + child.data;
                    next.data = ""
                }

                if (keepSpace[(node as Element).name]) {
                    child.data = child.data.replace(/\s*\n\s*$/g, "\n")
                } else {
                    child.data = child.data
                        .replace(/\s*\n+\s*/g, "\n")
                        .replace(/[ \t]{2,}/g, " ")
                }
            }
        }

        if (removeSpace && children.length === 1) {
            const child = children[0];
            if (isText(child) && child.data !== "" && !/\S/.test(child.data)) {
                child.data = "";
            }
        }

        if (isElement(node)) {
            slimAttr(node)
        }
    }
});
