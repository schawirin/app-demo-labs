"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackViewportResize = trackViewportResize;
exports.tackVisualViewportResize = tackVisualViewportResize;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var types_1 = require("../../../types");
var viewports_1 = require("../viewports");
var assembly_1 = require("../assembly");
var VISUAL_VIEWPORT_OBSERVER_THRESHOLD = 200;
function trackViewportResize(configuration, viewportResizeCb) {
    var viewportResizeSubscription = (0, browser_rum_core_1.initViewportObservable)(configuration).subscribe(function (data) {
        viewportResizeCb((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.ViewportResize, data));
    });
    return {
        stop: function () {
            viewportResizeSubscription.unsubscribe();
        },
    };
}
function tackVisualViewportResize(configuration, visualViewportResizeCb) {
    var visualViewport = window.visualViewport;
    if (!visualViewport) {
        return { stop: browser_core_1.noop };
    }
    var _a = (0, browser_core_1.throttle)(function () {
        visualViewportResizeCb({
            data: (0, viewports_1.getVisualViewport)(visualViewport),
            type: types_1.RecordType.VisualViewport,
            timestamp: (0, browser_core_1.timeStampNow)(),
        });
    }, VISUAL_VIEWPORT_OBSERVER_THRESHOLD, {
        trailing: false,
    }), updateDimension = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = (0, browser_core_1.addEventListeners)(configuration, visualViewport, [browser_core_1.DOM_EVENT.RESIZE, browser_core_1.DOM_EVENT.SCROLL], updateDimension, {
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
//# sourceMappingURL=trackViewportResize.js.map