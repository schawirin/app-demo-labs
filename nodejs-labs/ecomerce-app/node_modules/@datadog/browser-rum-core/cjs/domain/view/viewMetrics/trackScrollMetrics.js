"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THROTTLE_SCROLL_DURATION = void 0;
exports.trackScrollMetrics = trackScrollMetrics;
exports.computeScrollValues = computeScrollValues;
exports.createScrollValuesObservable = createScrollValuesObservable;
var browser_core_1 = require("@datadog/browser-core");
var scroll_1 = require("../../../browser/scroll");
var viewportObservable_1 = require("../../../browser/viewportObservable");
/** Arbitrary scroll throttle duration */
exports.THROTTLE_SCROLL_DURATION = browser_core_1.ONE_SECOND;
function trackScrollMetrics(configuration, viewStart, callback, scrollValues) {
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
            var now = (0, browser_core_1.relativeNow)();
            maxScrollHeightTime = (0, browser_core_1.elapsed)(viewStart.relative, now);
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
function computeScrollValues() {
    var scrollTop = (0, scroll_1.getScrollY)();
    var height = (0, viewportObservable_1.getViewportDimension)().height;
    var scrollHeight = Math.round((document.scrollingElement || document.documentElement).scrollHeight);
    var scrollDepth = Math.round(height + scrollTop);
    return {
        scrollHeight: scrollHeight,
        scrollDepth: scrollDepth,
        scrollTop: scrollTop,
    };
}
function createScrollValuesObservable(configuration, throttleDuration) {
    if (throttleDuration === void 0) { throttleDuration = exports.THROTTLE_SCROLL_DURATION; }
    return new browser_core_1.Observable(function (observable) {
        function notify() {
            observable.notify(computeScrollValues());
        }
        if (window.ResizeObserver) {
            var throttledNotify_1 = (0, browser_core_1.throttle)(notify, throttleDuration, {
                leading: false,
                trailing: true,
            });
            var observerTarget_1 = document.scrollingElement || document.documentElement;
            var resizeObserver_1 = new ResizeObserver((0, browser_core_1.monitor)(throttledNotify_1.throttled));
            resizeObserver_1.observe(observerTarget_1);
            var eventListener_1 = (0, browser_core_1.addEventListener)(configuration, window, browser_core_1.DOM_EVENT.SCROLL, throttledNotify_1.throttled, {
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