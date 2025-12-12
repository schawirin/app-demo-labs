"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeakSet = void 0;
exports.cssEscape = cssEscape;
exports.elementMatches = elementMatches;
exports.getParentElement = getParentElement;
exports.getClassList = getClassList;
// https://github.com/jquery/jquery/blob/a684e6ba836f7c553968d7d026ed7941e1a612d8/src/selector/escapeSelector.js
function cssEscape(str) {
    if (window.CSS && window.CSS.escape) {
        return window.CSS.escape(str);
    }
    // eslint-disable-next-line no-control-regex
    return str.replace(/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g, function (ch, asCodePoint) {
        if (asCodePoint) {
            // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
            if (ch === '\0') {
                return '\uFFFD';
            }
            // Control characters and (dependent upon position) numbers get escaped as code points
            return "".concat(ch.slice(0, -1), "\\").concat(ch.charCodeAt(ch.length - 1).toString(16), " ");
        }
        // Other potentially-special ASCII characters get backslash-escaped
        return "\\".concat(ch);
    });
}
function elementMatches(element, selector) {
    if (element.matches) {
        return element.matches(selector);
    }
    // IE11 support
    if (element.msMatchesSelector) {
        return element.msMatchesSelector(selector);
    }
    return false;
}
/**
 * Return the parentElement of an node
 *
 * In cases where parentElement is not supported, such as in IE11 for SVG nodes, we fallback to parentNode
 */
function getParentElement(node) {
    if (node.parentElement) {
        return node.parentElement;
    }
    while (node.parentNode) {
        if (node.parentNode.nodeType === Node.ELEMENT_NODE) {
            return node.parentNode;
        }
        node = node.parentNode;
    }
    return null;
}
/**
 * Return the classList of an element or an array of classes if classList is not supported
 *
 * In cases where classList is not supported, such as in IE11 for SVG and MathML elements,
 * we fallback to using element.getAttribute('class').
 * We opt for element.getAttribute('class') over element.className because className returns an SVGAnimatedString for SVG elements.
 */
function getClassList(element) {
    var _a;
    if (element.classList) {
        return element.classList;
    }
    var classes = (_a = element.getAttribute('class')) === null || _a === void 0 ? void 0 : _a.trim();
    return classes ? classes.split(/\s+/) : [];
}
// ie11 supports WeakMap but not WeakSet
var PLACEHOLDER = 1;
var WeakSet = /** @class */ (function () {
    function WeakSet(initialValues) {
        var _this = this;
        this.map = new WeakMap();
        if (initialValues) {
            initialValues.forEach(function (value) { return _this.map.set(value, PLACEHOLDER); });
        }
    }
    WeakSet.prototype.add = function (value) {
        this.map.set(value, PLACEHOLDER);
        return this;
    };
    WeakSet.prototype.delete = function (value) {
        return this.map.delete(value);
    };
    WeakSet.prototype.has = function (value) {
        return this.map.has(value);
    };
    return WeakSet;
}());
exports.WeakSet = WeakSet;
//# sourceMappingURL=polyfills.js.map