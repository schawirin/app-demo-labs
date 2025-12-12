export declare function cssEscape(str: string): string;
export declare function elementMatches(element: Element & {
    msMatchesSelector?(selector: string): boolean;
}, selector: string): boolean;
/**
 * Return the parentElement of an node
 *
 * In cases where parentElement is not supported, such as in IE11 for SVG nodes, we fallback to parentNode
 */
export declare function getParentElement(node: Node): HTMLElement | null;
/**
 * Return the classList of an element or an array of classes if classList is not supported
 *
 * In cases where classList is not supported, such as in IE11 for SVG and MathML elements,
 * we fallback to using element.getAttribute('class').
 * We opt for element.getAttribute('class') over element.className because className returns an SVGAnimatedString for SVG elements.
 */
export declare function getClassList(element: Element): DOMTokenList | string[];
export declare class WeakSet<T extends object> {
    private map;
    constructor(initialValues?: T[]);
    add(value: T): this;
    delete(value: T): boolean;
    has(value: T): boolean;
}
