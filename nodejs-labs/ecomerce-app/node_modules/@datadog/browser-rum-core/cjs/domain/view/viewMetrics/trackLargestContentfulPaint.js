"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LCP_MAXIMUM_DELAY = void 0;
exports.trackLargestContentfulPaint = trackLargestContentfulPaint;
var browser_core_1 = require("@datadog/browser-core");
var performanceCollection_1 = require("../../../browser/performanceCollection");
var getSelectorFromElement_1 = require("../../getSelectorFromElement");
// Discard LCP timings above a certain delay to avoid incorrect data
// It happens in some cases like sleep mode or some browser implementations
exports.LCP_MAXIMUM_DELAY = 10 * browser_core_1.ONE_MINUTE;
/**
 * Track the largest contentful paint (LCP) occurring during the initial View.  This can yield
 * multiple values, only the most recent one should be used.
 * Documentation: https://web.dev/lcp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/onLCP.ts
 */
function trackLargestContentfulPaint(lifeCycle, configuration, firstHidden, eventTarget, callback) {
    // Ignore entries that come after the first user interaction. According to the documentation, the
    // browser should not send largest-contentful-paint entries after a user interact with the page,
    // but the web-vitals reference implementation uses this as a safeguard.
    var firstInteractionTimestamp = Infinity;
    var stopEventListener = (0, browser_core_1.addEventListeners)(configuration, eventTarget, [browser_core_1.DOM_EVENT.POINTER_DOWN, browser_core_1.DOM_EVENT.KEY_DOWN], function (event) {
        firstInteractionTimestamp = event.timeStamp;
    }, { capture: true, once: true }).stop;
    var biggestLcpSize = 0;
    var unsubscribeLifeCycle = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        var lcpEntry = (0, browser_core_1.findLast)(entries, function (entry) {
            return entry.entryType === performanceCollection_1.RumPerformanceEntryType.LARGEST_CONTENTFUL_PAINT &&
                entry.startTime < firstInteractionTimestamp &&
                entry.startTime < firstHidden.timeStamp &&
                entry.startTime < exports.LCP_MAXIMUM_DELAY &&
                // Ensure to get the LCP entry with the biggest size, see
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1516655
                entry.size > biggestLcpSize;
        });
        if (lcpEntry) {
            var lcpTargetSelector = void 0;
            if (lcpEntry.element) {
                lcpTargetSelector = (0, getSelectorFromElement_1.getSelectorFromElement)(lcpEntry.element, configuration.actionNameAttribute);
            }
            callback({
                value: lcpEntry.startTime,
                targetSelector: lcpTargetSelector,
            });
            biggestLcpSize = lcpEntry.size;
        }
    }).unsubscribe;
    return {
        stop: function () {
            stopEventListener();
            unsubscribeLifeCycle();
        },
    };
}
//# sourceMappingURL=trackLargestContentfulPaint.js.map