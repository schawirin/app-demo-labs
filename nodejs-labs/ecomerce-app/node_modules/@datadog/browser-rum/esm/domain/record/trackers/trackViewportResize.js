import { throttle, DOM_EVENT, addEventListeners, timeStampNow, noop } from '@datadog/browser-core';
import { initViewportObservable } from '@datadog/browser-rum-core';
import { IncrementalSource, RecordType } from '../../../types';
import { getVisualViewport } from '../viewports';
import { assembleIncrementalSnapshot } from '../assembly';
var VISUAL_VIEWPORT_OBSERVER_THRESHOLD = 200;
export function trackViewportResize(configuration, viewportResizeCb) {
    var viewportResizeSubscription = initViewportObservable(configuration).subscribe(function (data) {
        viewportResizeCb(assembleIncrementalSnapshot(IncrementalSource.ViewportResize, data));
    });
    return {
        stop: function () {
            viewportResizeSubscription.unsubscribe();
        },
    };
}
export function tackVisualViewportResize(configuration, visualViewportResizeCb) {
    var visualViewport = window.visualViewport;
    if (!visualViewport) {
        return { stop: noop };
    }
    var _a = throttle(function () {
        visualViewportResizeCb({
            data: getVisualViewport(visualViewport),
            type: RecordType.VisualViewport,
            timestamp: timeStampNow(),
        });
    }, VISUAL_VIEWPORT_OBSERVER_THRESHOLD, {
        trailing: false,
    }), updateDimension = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = addEventListeners(configuration, visualViewport, [DOM_EVENT.RESIZE, DOM_EVENT.SCROLL], updateDimension, {
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