import { DOM_EVENT, ONE_MINUTE, addEventListeners, findLast } from '@datadog/browser-core';
import { RumPerformanceEntryType } from '../../../browser/performanceCollection';
import { getSelectorFromElement } from '../../getSelectorFromElement';
// Discard LCP timings above a certain delay to avoid incorrect data
// It happens in some cases like sleep mode or some browser implementations
export var LCP_MAXIMUM_DELAY = 10 * ONE_MINUTE;
/**
 * Track the largest contentful paint (LCP) occurring during the initial View.  This can yield
 * multiple values, only the most recent one should be used.
 * Documentation: https://web.dev/lcp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/onLCP.ts
 */
export function trackLargestContentfulPaint(lifeCycle, configuration, firstHidden, eventTarget, callback) {
    // Ignore entries that come after the first user interaction. According to the documentation, the
    // browser should not send largest-contentful-paint entries after a user interact with the page,
    // but the web-vitals reference implementation uses this as a safeguard.
    var firstInteractionTimestamp = Infinity;
    var stopEventListener = addEventListeners(configuration, eventTarget, [DOM_EVENT.POINTER_DOWN, DOM_EVENT.KEY_DOWN], function (event) {
        firstInteractionTimestamp = event.timeStamp;
    }, { capture: true, once: true }).stop;
    var biggestLcpSize = 0;
    var unsubscribeLifeCycle = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        var lcpEntry = findLast(entries, function (entry) {
            return entry.entryType === RumPerformanceEntryType.LARGEST_CONTENTFUL_PAINT &&
                entry.startTime < firstInteractionTimestamp &&
                entry.startTime < firstHidden.timeStamp &&
                entry.startTime < LCP_MAXIMUM_DELAY &&
                // Ensure to get the LCP entry with the biggest size, see
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1516655
                entry.size > biggestLcpSize;
        });
        if (lcpEntry) {
            var lcpTargetSelector = void 0;
            if (lcpEntry.element) {
                lcpTargetSelector = getSelectorFromElement(lcpEntry.element, configuration.actionNameAttribute);
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