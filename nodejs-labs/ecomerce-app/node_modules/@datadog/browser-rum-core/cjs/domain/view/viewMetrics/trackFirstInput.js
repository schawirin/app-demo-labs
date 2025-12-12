"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackFirstInput = trackFirstInput;
var browser_core_1 = require("@datadog/browser-core");
var htmlDomUtils_1 = require("../../../browser/htmlDomUtils");
var performanceCollection_1 = require("../../../browser/performanceCollection");
var getSelectorFromElement_1 = require("../../getSelectorFromElement");
/**
 * Track the first input occurring during the initial View to return:
 * - First Input Delay
 * - First Input Time
 * Callback is called at most one time.
 * Documentation: https://web.dev/fid/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/master/src/getFID.ts
 */
function trackFirstInput(lifeCycle, configuration, firstHidden, callback) {
    var unsubscribeLifeCycle = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        var firstInputEntry = (0, browser_core_1.find)(entries, function (entry) {
            return entry.entryType === performanceCollection_1.RumPerformanceEntryType.FIRST_INPUT && entry.startTime < firstHidden.timeStamp;
        });
        if (firstInputEntry) {
            var firstInputDelay = (0, browser_core_1.elapsed)(firstInputEntry.startTime, firstInputEntry.processingStart);
            var firstInputTargetSelector = void 0;
            if (firstInputEntry.target && (0, htmlDomUtils_1.isElementNode)(firstInputEntry.target)) {
                firstInputTargetSelector = (0, getSelectorFromElement_1.getSelectorFromElement)(firstInputEntry.target, configuration.actionNameAttribute);
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