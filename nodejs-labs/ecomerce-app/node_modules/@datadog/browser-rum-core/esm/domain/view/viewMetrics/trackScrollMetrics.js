import { Observable, ONE_SECOND, elapsed, relativeNow, throttle, addEventListener, DOM_EVENT, monitor, } from '@datadog/browser-core';
import { getScrollY } from '../../../browser/scroll';
import { getViewportDimension } from '../../../browser/viewportObservable';
/** Arbitrary scroll throttle duration */
export var THROTTLE_SCROLL_DURATION = ONE_SECOND;
export function trackScrollMetrics(configuration, viewStart, callback, scrollValues) {
    if (scrollValues === void 0) { scrollValues = createScrollValuesObservable(configuration); }
    var maxScrollDepth = 0;
    var maxScrollHeight = 0;
    var maxScrollHeightTime = 0;
    var subscription = scrollValues.subscribe(function (_a) {
        var scrollDepth = _a.scrollDepth, scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight;
        var shouldUpdate = false;
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            shouldUpdate = true;
        }
        if (scrollHeight > maxScrollHeight) {
            maxScrollHeight = scrollHeight;
            var now = relativeNow();
            maxScrollHeightTime = elapsed(viewStart.relative, now);
            shouldUpdate = true;
        }
        if (shouldUpdate) {
            callback({
                maxDepth: Math.min(maxScrollDepth, maxScrollHeight),
                maxDepthScrollTop: scrollTop,
                maxScrollHeight: maxScrollHeight,
                maxScrollHeightTime: maxScrollHeightTime,
            });
        }
    });
    return {
        stop: function () { return subscription.unsubscribe(); },
    };
}
export function computeScrollValues() {
    var scrollTop = getScrollY();
    var height = getViewportDimension().height;
    var scrollHeight = Math.round((document.scrollingElement || document.documentElement).scrollHeight);
    var scrollDepth = Math.round(height + scrollTop);
    return {
        scrollHeight: scrollHeight,
        scrollDepth: scrollDepth,
        scrollTop: scrollTop,
    };
}
export function createScrollValuesObservable(configuration, throttleDuration) {
    if (throttleDuration === void 0) { throttleDuration = THROTTLE_SCROLL_DURATION; }
    return new Observable(function (observable) {
        function notify() {
            observable.notify(computeScrollValues());
        }
        if (window.ResizeObserver) {
            var throttledNotify_1 = throttle(notify, throttleDuration, {
                leading: false,
                trailing: true,
            });
            var observerTarget_1 = document.scrollingElement || document.documentElement;
            var resizeObserver_1 = new ResizeObserver(monitor(throttledNotify_1.throttled));
            resizeObserver_1.observe(observerTarget_1);
            var eventListener_1 = addEventListener(configuration, window, DOM_EVENT.SCROLL, throttledNotify_1.throttled, {
                passive: true,
            });
            return function () {
                throttledNotify_1.cancel();
                resizeObserver_1.unobserve(observerTarget_1);
                eventListener_1.stop();
            };
        }
    });
}
//# sourceMappingURL=trackScrollMetrics.js.map