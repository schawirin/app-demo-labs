"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackMediaInteraction = trackMediaInteraction;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var types_1 = require("../../../types");
var eventsUtils_1 = require("../eventsUtils");
var serialization_1 = require("../serialization");
var assembly_1 = require("../assembly");
function trackMediaInteraction(configuration, mediaInteractionCb) {
    return (0, browser_core_1.addEventListeners)(configuration, document, [browser_core_1.DOM_EVENT.PLAY, browser_core_1.DOM_EVENT.PAUSE], function (event) {
        var target = (0, eventsUtils_1.getEventTarget)(event);
        if (!target ||
            (0, browser_rum_core_1.getNodePrivacyLevel)(target, configuration.defaultPrivacyLevel) === browser_rum_core_1.NodePrivacyLevel.HIDDEN ||
            !(0, serialization_1.hasSerializedNode)(target)) {
            return;
        }
        mediaInteractionCb((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.MediaInteraction, {
            id: (0, serialization_1.getSerializedNodeId)(target),
            type: event.type === browser_core_1.DOM_EVENT.PLAY ? types_1.MediaInteractionType.Play : types_1.MediaInteractionType.Pause,
        }));
    }, {
        capture: true,
        passive: true,
    });
}
//# sourceMappingURL=trackMediaInteraction.js.map