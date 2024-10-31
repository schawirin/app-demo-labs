import { relativeNow } from '@datadog/browser-core';
import { RumPerformanceEntryType } from '../../../browser/performanceCollection';
export function trackNavigationTimings(lifeCycle, callback) {
    var stop = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType === RumPerformanceEntryType.NAVIGATION) {
                callback({
                    domComplete: entry.domComplete,
                    domContentLoaded: entry.domContentLoadedEventEnd,
                    domInteractive: entry.domInteractive,
                    loadEvent: entry.loadEventEnd,
                    // In some cases the value reported is negative or is larger
                    // than the current page time. Ignore these cases:
                    // https://github.com/GoogleChrome/web-vitals/issues/137
                    // https://github.com/GoogleChrome/web-vitals/issues/162
                    firstByte: entry.responseStart >= 0 && entry.responseStart <= relativeNow() ? entry.responseStart : undefined,
                });
            }
        }
    }).unsubscribe;
    return { stop: stop };
}
//# sourceMappingURL=trackNavigationTimings.js.map