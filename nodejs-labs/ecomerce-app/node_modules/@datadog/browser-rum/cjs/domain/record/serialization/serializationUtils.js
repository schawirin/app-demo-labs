"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATA_URI = exports.ABSOLUTE_URL = exports.URL_IN_CSS_REF = void 0;
exports.hasSerializedNode = hasSerializedNode;
exports.nodeAndAncestorsHaveSerializedNode = nodeAndAncestorsHaveSerializedNode;
exports.getSerializedNodeId = getSerializedNodeId;
exports.setSerializedNodeId = setSerializedNodeId;
exports.getElementInputValue = getElementInputValue;
exports.switchToAbsoluteUrl = switchToAbsoluteUrl;
exports.makeUrlAbsolute = makeUrlAbsolute;
exports.getValidTagName = getValidTagName;
exports.censoredImageForSize = censoredImageForSize;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var serializedNodeIds = new WeakMap();
function hasSerializedNode(node) {
    return serializedNodeIds.has(node);
}
function nodeAndAncestorsHaveSerializedNode(node) {
    var current = node;
    while (current) {
        if (!hasSerializedNode(current) && !(0, browser_rum_core_1.isNodeShadowRoot)(current)) {
            return false;
        }
        current = (0, browser_rum_core_1.getParentNode)(current);
    }
    return true;
}
function getSerializedNodeId(node) {
    return serializedNodeIds.get(node);
}
function setSerializedNodeId(node, serializeNodeId) {
    serializedNodeIds.set(node, serializeNodeId);
}
/**
 * Get the element "value" to be serialized as an attribute or an input update record. It respects
 * the input privacy mode of the element.
 * PERFROMANCE OPTIMIZATION: Assumes that privacy level `HIDDEN` is never encountered because of earlier checks.
 */
function getElementInputValue(element, nodePrivacyLevel) {
    /*
     BROWSER SPEC NOTE: <input>, <select>
     For some <input> elements, the `value` is an exceptional property/attribute that has the
     value synced between el.value and el.getAttribute()
     input[type=button,checkbox,hidden,image,radio,reset,submit]
     */
    var tagName = element.tagName;
    var value = element.value;
    if ((0, browser_rum_core_1.shouldMaskNode)(element, nodePrivacyLevel)) {
        var type = element.type;
        if (tagName === 'INPUT' && (type === 'button' || type === 'submit' || type === 'reset')) {
            // Overrule `MASK` privacy level for button-like element values, as they are used during replay
            // to display their label. They can still be hidden via the "hidden" privacy attribute or class name.
            return value;
        }
        else if (!value || tagName === 'OPTION') {
            // <Option> value provides no benefit
            return;
        }
        return browser_rum_core_1.CENSORED_STRING_MARK;
    }
    if (tagName === 'OPTION' || tagName === 'SELECT') {
        return element.value;
    }
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
        return;
    }
    return value;
}
exports.URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")([^"]*)"|([^)]*))\)/gm;
exports.ABSOLUTE_URL = /^[A-Za-z]+:|^\/\//;
exports.DATA_URI = /^data:.*,/i;
function switchToAbsoluteUrl(cssText, cssHref) {
    return cssText.replace(exports.URL_IN_CSS_REF, function (matchingSubstring, singleQuote, urlWrappedInSingleQuotes, doubleQuote, urlWrappedInDoubleQuotes, urlNotWrappedInQuotes) {
        var url = urlWrappedInSingleQuotes || urlWrappedInDoubleQuotes || urlNotWrappedInQuotes;
        if (!cssHref || !url || exports.ABSOLUTE_URL.test(url) || exports.DATA_URI.test(url)) {
            return matchingSubstring;
        }
        var quote = singleQuote || doubleQuote || '';
        return "url(".concat(quote).concat(makeUrlAbsolute(url, cssHref)).concat(quote, ")");
    });
}
function makeUrlAbsolute(url, baseUrl) {
    try {
        return (0, browser_core_1.buildUrl)(url, baseUrl).href;
    }
    catch (_) {
        return url;
    }
}
var TAG_NAME_REGEX = /[^a-z1-6-_]/;
function getValidTagName(tagName) {
    var processedTagName = tagName.toLowerCase().trim();
    if (TAG_NAME_REGEX.test(processedTagName)) {
        // if the tag name is odd and we cannot extract
        // anything from the string, then we return a
        // generic div
        return 'div';
    }
    return processedTagName;
}
function censoredImageForSize(width, height) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='".concat(width, "' height='").concat(height, "' style='background-color:silver'%3E%3C/svg%3E");
}
//# sourceMappingURL=serializationUtils.js.map