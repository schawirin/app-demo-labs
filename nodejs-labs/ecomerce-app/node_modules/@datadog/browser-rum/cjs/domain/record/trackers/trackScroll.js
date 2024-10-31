"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackScroll = trackScroll;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var eventsUtils_1 = require("../eventsUtils");
var serialization_1 = require("../serialization");
var types_1 = require("../../../types");
var assembly_1 = require("../assembly");
var SCROLL_OBSERVER_THRESHOLD = 100;
function trackScroll(configuration, scrollCb, elementsScrollPositions, target) {
    if (target === void 0) { target = document; }
    var _a = (0, browser_core_1.throttle)(function (event) {
        var target = (0, eventsUtils_1.getEventTarget)(event);
        if (!target ||
            (0, browser_rum_core_1.getNodePrivacyLevel)(target, configuration.defaultPrivacyLevel) === browser_rum_core_1.NodePrivacyLevel.HIDDEN ||
            !(0, serialization_1.hasSerializedNode)(target)) {
            return;
        }
        var id = (0, serialization_1.getSerializedNodeId)(target);
        var scrollPositions = target === document
            ? {
                scrollTop: (0, browser_rum_core_1.getScrollY)(),
                scrollLeft: (0, browser_rum_core_1.getScrollX)(),
            }
            : {
                scrollTop: Math.round(target.scrollTop),
                scrollLeft: Math.round(target.scrollLeft),
            };
        elementsScrollPositions.set(target, scrollPositions);
        scrollCb((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.Scroll, {
            id: id,
            x: scrollPositions.scrollLeft,
            y: scrollPositions.scrollTop,
        }));
    }, SCROLL_OBSERVER_THRESHOLD), updatePosition = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = (0, browser_core_1.addEventListener)(configuration, target, browser_core_1.DOM_EVENT.SCROLL, updatePosition, {
        capture: true,
        passive: true,
    }).stop;
    return {
        stop: function () {
            removeListener();
            cancelThrottle();
        },
    };
}
//# sourceMappingURL=trackScroll.js.map