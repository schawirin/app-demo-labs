"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackMouseInteraction = trackMouseInteraction;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var types_1 = require("../../../types");
var assembly_1 = require("../assembly");
var eventsUtils_1 = require("../eventsUtils");
var serialization_1 = require("../serialization");
var trackMove_1 = require("./trackMove");
var eventTypeToMouseInteraction = (_a = {},
    // Listen for pointerup DOM events instead of mouseup for MouseInteraction/MouseUp records. This
    // allows to reference such records from Frustration records.
    //
    // In the context of supporting Mobile Session Replay, we introduced `PointerInteraction` records
    // used by the Mobile SDKs in place of `MouseInteraction`. In the future, we should replace
    // `MouseInteraction` by `PointerInteraction` in the Browser SDK so we have an uniform way to
    // convey such interaction. This would cleanly solve the issue since we would have
    // `PointerInteraction/Up` records that we could reference from `Frustration` records.
    _a[browser_core_1.DOM_EVENT.POINTER_UP] = types_1.MouseInteractionType.MouseUp,
    _a[browser_core_1.DOM_EVENT.MOUSE_DOWN] = types_1.MouseInteractionType.MouseDown,
    _a[browser_core_1.DOM_EVENT.CLICK] = types_1.MouseInteractionType.Click,
    _a[browser_core_1.DOM_EVENT.CONTEXT_MENU] = types_1.MouseInteractionType.ContextMenu,
    _a[browser_core_1.DOM_EVENT.DBL_CLICK] = types_1.MouseInteractionType.DblClick,
    _a[browser_core_1.DOM_EVENT.FOCUS] = types_1.MouseInteractionType.Focus,
    _a[browser_core_1.DOM_EVENT.BLUR] = types_1.MouseInteractionType.Blur,
    _a[browser_core_1.DOM_EVENT.TOUCH_START] = types_1.MouseInteractionType.TouchStart,
    _a[browser_core_1.DOM_EVENT.TOUCH_END] = types_1.MouseInteractionType.TouchEnd,
    _a);
function trackMouseInteraction(configuration, mouseInteractionCb, recordIds) {
    var handler = function (event) {
        var target = (0, eventsUtils_1.getEventTarget)(event);
        if ((0, browser_rum_core_1.getNodePrivacyLevel)(target, configuration.defaultPrivacyLevel) === browser_rum_core_1.NodePrivacyLevel.HIDDEN ||
            !(0, serialization_1.hasSerializedNode)(target)) {
            return;
        }
        var id = (0, serialization_1.getSerializedNodeId)(target);
        var type = eventTypeToMouseInteraction[event.type];
        var interaction;
        if (type !== types_1.MouseInteractionType.Blur && type !== types_1.MouseInteractionType.Focus) {
            var coordinates = (0, trackMove_1.tryToComputeCoordinates)(event);
            if (!coordinates) {
                return;
            }
            interaction = { id: id, type: type, x: coordinates.x, y: coordinates.y };
        }
        else {
            interaction = { id: id, type: type };
        }
        var record = (0, browser_core_1.assign)({ id: recordIds.getIdForEvent(event) }, (0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.MouseInteraction, interaction));
        mouseInteractionCb(record);
    };
    return (0, browser_core_1.addEventListeners)(configuration, document, Object.keys(eventTypeToMouseInteraction), handler, {
        capture: true,
        passive: true,
    });
}
//# sourceMappingURL=trackMouseInteraction.js.map