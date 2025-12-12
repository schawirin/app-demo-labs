import { ONE_MINUTE, find } from '@datadog/browser-core';
import { RumPerformanceEntryType } from '../../../browser/performanceCollection';
// Discard FCP timings above a certain delay to avoid incorrect data
// It happens in some cases like sleep mode or some browser implementations
export var FCP_MAXIMUM_DELAY = 10 * ONE_MINUTE;
export function trackFirstContentfulPaint(lifeCycle, firstHidden, callback) {
    var unsubscribeLifeCycle = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        var fcpEntry = find(entries, function (entry) {
            return entry.entryType === RumPerformanceEntryType.PAINT &&
                entry.name === 'first-contentful-paint' &&
                entry.startTime < firstHidden.timeStamp &&
                entry.startTime < FCP_MAXIMUM_DELAY;
        });
        if (fcpEntry) {
            callback(fcpEntry.startTime);
        }
    }).unsubscribe;
    return {
        stop: unsubscribeLifeCycle,
    };
}
//# sourceMappingURL=trackFirstContentfulPaint.js.map