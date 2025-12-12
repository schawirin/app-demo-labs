import { reducePrivacyLevel, getNodeSelfPrivacyLevel, getTextContent, isNodeShadowRoot, hasChildNodes, forEachChildNodes, NodePrivacyLevel, PRIVACY_ATTR_NAME, PRIVACY_ATTR_VALUE_HIDDEN, } from '@datadog/browser-rum-core';
import { assign } from '@datadog/browser-core';
import { NodeType } from '../../../types';
import { getSerializedNodeId, getValidTagName, setSerializedNodeId } from './serializationUtils';
import { serializeStyleSheets } from './serializeStyleSheets';
import { serializeAttributes } from './serializeAttributes';
export function serializeNodeWithId(node, options) {
    var serializedNode = serializeNode(node, options);
    if (!serializedNode) {
        return null;
    }
    // Try to reuse the previous id
    var id = getSerializedNodeId(node) || generateNextId();
    var serializedNodeWithId = serializedNode;
    serializedNodeWithId.id = id;
    setSerializedNodeId(node, id);
    if (options.serializedNodeIds) {
        options.serializedNodeIds.add(id);
    }
    return serializedNodeWithId;
}
var _nextId = 1;
export function generateNextId() {
    return _nextId++;
}
export function serializeChildNodes(node, options) {
    var result = [];
    forEachChildNodes(node, function (childNode) {
        var serializedChildNode = serializeNodeWithId(childNode, options);
        if (serializedChildNode) {
            result.push(serializedChildNode);
        }
    });
    return result;
}
function serializeNode(node, options) {
    switch (node.nodeType) {
        case node.DOCUMENT_NODE:
            return serializeDocumentNode(node, options);
        case node.DOCUMENT_FRAGMENT_NODE:
            return serializeDocumentFragmentNode(node, options);
        case node.DOCUMENT_TYPE_NODE:
            return serializeDocumentTypeNode(node);
        case node.ELEMENT_NODE:
            return serializeElementNode(node, options);
        case node.TEXT_NODE:
            return serializeTextNode(node, options);
        case node.CDATA_SECTION_NODE:
            return serializeCDataNode();
    }
}
export function serializeDocumentNode(document, options) {
    return {
        type: NodeType.Document,
        childNodes: serializeChildNodes(document, options),
        adoptedStyleSheets: serializeStyleSheets(document.adoptedStyleSheets),
    };
}
function serializeDocumentFragmentNode(element, options) {
    var isShadowRoot = isNodeShadowRoot(element);
    if (isShadowRoot) {
        options.serializationContext.shadowRootsController.addShadowRoot(element);
    }
    return {
        type: NodeType.DocumentFragment,
        childNodes: serializeChildNodes(element, options),
        isShadowRoot: isShadowRoot,
        adoptedStyleSheets: isShadowRoot ? serializeStyleSheets(element.adoptedStyleSheets) : undefined,
    };
}
function serializeDocumentTypeNode(documentType) {
    return {
        type: NodeType.DocumentType,
        name: documentType.name,
        publicId: documentType.publicId,
        systemId: documentType.systemId,
    };
}
/**
 * Serializing Element nodes involves capturing:
 * 1. HTML ATTRIBUTES:
 * 2. JS STATE:
 * - scroll offsets
 * - Form fields (input value, checkbox checked, option selection, range)
 * - Canvas state,
 * - Media (video/audio) play mode + currentTime
 * - iframe contents
 * - webcomponents
 * 3. CUSTOM PROPERTIES:
 * - height+width for when `hidden` to cover the element
 * 4. EXCLUDED INTERACTION STATE:
 * - focus (possible, but not worth perf impact)
 * - hover (tracked only via mouse activity)
 * - fullscreen mode
 */
function serializeElementNode(element, options) {
    var _a;
    var tagName = getValidTagName(element.tagName);
    var isSVG = isSVGElement(element) || undefined;
    // For performance reason, we don't use getNodePrivacyLevel directly: we leverage the
    // parentNodePrivacyLevel option to avoid iterating over all parents
    var nodePrivacyLevel = reducePrivacyLevel(getNodeSelfPrivacyLevel(element), options.parentNodePrivacyLevel);
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        var _b = element.getBoundingClientRect(), width = _b.width, height = _b.height;
        return {
            type: NodeType.Element,
            tagName: tagName,
            attributes: (_a = {
                    rr_width: "".concat(width, "px"),
                    rr_height: "".concat(height, "px")
                },
                _a[PRIVACY_ATTR_NAME] = PRIVACY_ATTR_VALUE_HIDDEN,
                _a),
            childNodes: [],
            isSVG: isSVG,
        };
    }
    // Ignore Elements like Script and some Link, Metas
    if (nodePrivacyLevel === NodePrivacyLevel.IGNORE) {
        return;
    }
    var attributes = serializeAttributes(element, nodePrivacyLevel, options);
    var childNodes = [];
    if (hasChildNodes(element) &&
        // Do not serialize style children as the css rules are already in the _cssText attribute
        tagName !== 'style') {
        // OBJECT POOLING OPTIMIZATION:
        // We should not create a new object systematically as it could impact performances. Try to reuse
        // the same object as much as possible, and clone it only if we need to.
        var childNodesSerializationOptions = void 0;
        if (options.parentNodePrivacyLevel === nodePrivacyLevel && options.ignoreWhiteSpace === (tagName === 'head')) {
            childNodesSerializationOptions = options;
        }
        else {
            childNodesSerializationOptions = assign({}, options, {
                parentNodePrivacyLevel: nodePrivacyLevel,
                ignoreWhiteSpace: tagName === 'head',
            });
        }
        childNodes = serializeChildNodes(element, childNodesSerializationOptions);
    }
    return {
        type: NodeType.Element,
        tagName: tagName,
        attributes: attributes,
        childNodes: childNodes,
        isSVG: isSVG,
    };
}
function isSVGElement(el) {
    return el.tagName === 'svg' || el instanceof SVGElement;
}
/**
 * Text Nodes are dependant on Element nodes
 * Privacy levels are set on elements so we check the parentElement of a text node
 * for privacy level.
 */
function serializeTextNode(textNode, options) {
    var textContent = getTextContent(textNode, options.ignoreWhiteSpace || false, options.parentNodePrivacyLevel);
    if (textContent === undefined) {
        return;
    }
    return {
        type: NodeType.Text,
        textContent: textContent,
    };
}
function serializeCDataNode() {
    return {
        type: NodeType.CDATA,
        textContent: '',
    };
}
//# sourceMappingURL=serializeNode.js.map