import { Observable, throttle, addEventListener, DOM_EVENT } from '@datadog/browser-core';
var viewportObservable;
export function initViewportObservable(configuration) {
    if (!viewportObservable) {
        viewportObservable = createViewportObservable(configuration);
    }
    return viewportObservable;
}
export function createViewportObservable(configuration) {
    return new Observable(function (observable) {
        var updateDimension = throttle(function () {
            observable.notify(getViewportDimension());
        }, 200).throttled;
        return addEventListener(configuration, window, DOM_EVENT.RESIZE, updateDimension, { capture: true, passive: true })
            .stop;
    });
}
// excludes the width and height of any rendered classic scrollbar that is fixed to the visual viewport
export function getViewportDimension() {
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