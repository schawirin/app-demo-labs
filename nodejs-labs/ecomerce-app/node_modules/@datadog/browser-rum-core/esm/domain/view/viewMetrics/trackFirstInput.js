import { elapsed, find } from '@datadog/browser-core';
import { isElementNode } from '../../../browser/htmlDomUtils';
import { RumPerformanceEntryType } from '../../../browser/performanceCollection';
import { getSelectorFromElement } from '../../getSelectorFromElement';
/**
 * Track the first input occurring during the initial View to return:
 * - First Input Delay
 * - First Input Time
 * Callback is called at most one time.
 * Documentation: https://web.dev/fid/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getFID.ts
 */
export function trackFirstInput(lifeCycle, configuration, firstHidden, callback) {
    var unsubscribeLifeCycle = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        var firstInputEntry = find(entries, function (entry) {
            return entry.entryType === RumPerformanceEntryType.FIRST_INPUT && entry.startTime < firstHidden.timeStamp;
        });
        if (firstInputEntry) {
            var firstInputDelay = elapsed(firstInputEntry.startTime, firstInputEntry.processingStart);
            var firstInputTargetSelector = void 0;
            if (firstInputEntry.target && isElementNode(firstInputEntry.target)) {
                firstInputTargetSelector = getSelectorFromElement(firstInputEntry.target, configuration.actionNameAttribute);
            }
            callback({
                // Ensure firstInputDelay to be positive, see
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1185815
                delay: firstInputDelay >= 0 ? firstInputDelay : 0,
                time: firstInputEntry.startTime,
                targetSelector: firstInputTargetSelector,
            });
        }
    }).unsubscribe;
    return {
        stop: unsubscribeLifeCycle,
    };
}
//# sourceMappingURL=trackFirstInput.js.map