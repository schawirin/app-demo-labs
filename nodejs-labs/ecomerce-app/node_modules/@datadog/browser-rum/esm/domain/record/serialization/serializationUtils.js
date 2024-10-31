import { buildUrl } from '@datadog/browser-core';
import { getParentNode, isNodeShadowRoot, CENSORED_STRING_MARK, shouldMaskNode } from '@datadog/browser-rum-core';
var serializedNodeIds = new WeakMap();
export function hasSerializedNode(node) {
    return serializedNodeIds.has(node);
}
export function nodeAndAncestorsHaveSerializedNode(node) {
    var current = node;
    while (current) {
        if (!hasSerializedNode(current) && !isNodeShadowRoot(current)) {
            return false;
        }
        current = getParentNode(current);
    }
    return true;
}
export function getSerializedNodeId(node) {
    return serializedNodeIds.get(node);
}
export function setSerializedNodeId(node, serializeNodeId) {
    serializedNodeIds.set(node, serializeNodeId);
}
/**
 * Get the element "value" to be serialized as an attribute or an input update record. It respects
 * the input privacy mode of the element.
 * PERFROMANCE OPTIMIZATION: Assumes that privacy level `HIDDEN` is never encountered because of earlier checks.
 */
export function getElementInputValue(element, nodePrivacyLevel) {
    /*
     BROWSER SPEC NOTE: <input>, <select>
     For some <input> elements, the `value` is an exceptional property/attribute that has the
     value synced between el.value and el.getAttribute()
     input[type=button,checkbox,hidden,image,radio,reset,submit]
     */
    var tagName = element.tagName;
    var value = element.value;
    if (shouldMaskNode(element, nodePrivacyLevel)) {
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
        return CENSORED_STRING_MARK;
    }
    if (tagName === 'OPTION' || tagName === 'SELECT') {
        return element.value;
    }
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
        return;
    }
    return value;
}
export var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")([^"]*)"|([^)]*))\)/gm;
export var ABSOLUTE_URL = /^[A-Za-z]+:|^\/\//;
export var DATA_URI = /^data:.*,/i;
export function switchToAbsoluteUrl(cssText, cssHref) {
    return cssText.replace(URL_IN_CSS_REF, function (matchingSubstring, singleQuote, urlWrappedInSingleQuotes, doubleQuote, urlWrappedInDoubleQuotes, urlNotWrappedInQuotes) {
        var url = urlWrappedInSingleQuotes || urlWrappedInDoubleQuotes || urlNotWrappedInQuotes;
        if (!cssHref || !url || ABSOLUTE_URL.test(url) || DATA_URI.test(url)) {
            return matchingSubstring;
        }
        var quote = singleQuote || doubleQuote || '';
        return "url(".concat(quote).concat(makeUrlAbsolute(url, cssHref)).concat(quote, ")");
    });
}
export function makeUrlAbsolute(url, baseUrl) {
    try {
        return buildUrl(url, baseUrl).href;
    }
    catch (_) {
        return url;
    }
}
var TAG_NAME_REGEX = /[^a-z1-6-_]/;
export function getValidTagName(tagName) {
    var processedTagName = tagName.toLowerCase().trim();
    if (TAG_NAME_REGEX.test(processedTagName)) {
        // if the tag name is odd and we cannot extract
        // anything from the string, then we return a
        // generic div
        return 'div';
    }
    return processedTagName;
}
export function censoredImageForSize(width, height) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='".concat(width, "' height='").concat(height, "' style='background-color:silver'%3E%3C/svg%3E");
}
//# sourceMappingURL=serializationUtils.js.map