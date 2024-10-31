"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeAttribute = serializeAttribute;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var serializationUtils_1 = require("./serializationUtils");
function serializeAttribute(element, nodePrivacyLevel, attributeName, configuration) {
    if (nodePrivacyLevel === browser_rum_core_1.NodePrivacyLevel.HIDDEN) {
        // dup condition for direct access case
        return null;
    }
    var attributeValue = element.getAttribute(attributeName);
    if (nodePrivacyLevel === browser_rum_core_1.NodePrivacyLevel.MASK &&
        attributeName !== browser_rum_core_1.PRIVACY_ATTR_NAME &&
        !browser_rum_core_1.STABLE_ATTRIBUTES.includes(attributeName) &&
        attributeName !== configuration.actionNameAttribute) {
        var tagName = element.tagName;
        switch (attributeName) {
            // Mask Attribute text content
            case 'title':
            case 'alt':
            case 'placeholder':
                return browser_rum_core_1.CENSORED_STRING_MARK;
        }
        // mask image URLs
        if (tagName === 'IMG' && (attributeName === 'src' || attributeName === 'srcset')) {
            // generate image with similar dimension than the original to have the same rendering behaviour
            var image = element;
            if (image.naturalWidth > 0) {
                return (0, serializationUtils_1.censoredImageForSize)(image.naturalWidth, image.naturalHeight);
            }
            var _a = element.getBoundingClientRect(), width = _a.width, height = _a.height;
            if (width > 0 || height > 0) {
                return (0, serializationUtils_1.censoredImageForSize)(width, height);
            }
            // if we can't get the image size, fallback to the censored image
            return browser_rum_core_1.CENSORED_IMG_MARK;
        }
        // mask source URLs
        if (tagName === 'SOURCE' && (attributeName === 'src' || attributeName === 'srcset')) {
            return browser_rum_core_1.CENSORED_IMG_MARK;
        }
        // mask <a> URLs
        if (tagName === 'A' && attributeName === 'href') {
            return browser_rum_core_1.CENSORED_STRING_MARK;
        }
        // mask data-* attributes
        if (attributeValue && (0, browser_core_1.startsWith)(attributeName, 'data-')) {
            // Exception: it's safe to reveal the `${PRIVACY_ATTR_NAME}` attr
            return browser_rum_core_1.CENSORED_STRING_MARK;
        }
        // mask iframe srcdoc
        if (tagName === 'IFRAME' && attributeName === 'srcdoc') {
            return browser_rum_core_1.CENSORED_STRING_MARK;
        }
    }
    if (!attributeValue || typeof attributeValue !== 'string') {
        return attributeValue;
    }
    // Minimum Fix for customer.
    if ((0, browser_rum_core_1.isLongDataUrl)(attributeValue)) {
        return (0, browser_rum_core_1.sanitizeDataUrl)(attributeValue);
    }
    return attributeValue;
}
//# sourceMappingURL=serializeAttribute.js.map