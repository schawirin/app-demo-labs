"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initViewportObservable = initViewportObservable;
exports.createViewportObservable = createViewportObservable;
exports.getViewportDimension = getViewportDimension;
var browser_core_1 = require("@datadog/browser-core");
var viewportObservable;
function initViewportObservable(configuration) {
    if (!viewportObservable) {
        viewportObservable = createViewportObservable(configuration);
    }
    return viewportObservable;
}
function createViewportObservable(configuration) {
    return new browser_core_1.Observable(function (observable) {
        var updateDimension = (0, browser_core_1.throttle)(function () {
            observable.notify(getViewportDimension());
        }, 200).throttled;
        return (0, browser_core_1.addEventListener)(configuration, window, browser_core_1.DOM_EVENT.RESIZE, updateDimension, { capture: true, passive: true })
            .stop;
    });
}
// excludes the width and height of any rendered classic scrollbar that is fixed to the visual viewport
function getViewportDimension() {
    var visual = window.visualViewport;
    if (visual) {
        return {
            width: Number(visual.width * visual.scale),
            height: Number(visual.height * visual.scale),
        };
    }
    return {
        width: Number(window.innerWidth || 0),
        height: Number(window.innerHeight || 0),
    };
}
//# sourceMappingURL=viewportObservable.js.map