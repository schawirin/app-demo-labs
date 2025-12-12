"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGE_ACTIVITY_END_DELAY = exports.PAGE_ACTIVITY_VALIDATION_DELAY = void 0;
exports.waitPageActivityEnd = waitPageActivityEnd;
exports.doWaitPageActivityEnd = doWaitPageActivityEnd;
exports.createPageActivityObservable = createPageActivityObservable;
var browser_core_1 = require("@datadog/browser-core");
var performanceCollection_1 = require("../browser/performanceCollection");
// Delay to wait for a page activity to validate the tracking process
exports.PAGE_ACTIVITY_VALIDATION_DELAY = 100;
// Delay to wait after a page activity to end the tracking process
exports.PAGE_ACTIVITY_END_DELAY = 100;
/**
 * Wait for the page activity end
 *
 * Detection lifecycle:
 * ```
 *                        Wait page activity end
 *              .-------------------'--------------------.
 *              v                                        v
 *     [Wait for a page activity ]          [Wait for a maximum duration]
 *     [timeout: VALIDATION_DELAY]          [  timeout: maxDuration     ]
 *          /                  \                           |
 *         v                    v                          |
 *  [No page activity]   [Page activity]                   |
 *         |                   |,----------------------.   |
 *         v                   v                       |   |
 *     (Discard)     [Wait for a page activity]        |   |
 *                   [   timeout: END_DELAY   ]        |   |
 *                       /                \            |   |
 *                      v                  v           |   |
 *             [No page activity]    [Page activity]   |   |
 *                      |                 |            |   |
 *                      |                 '------------'   |
 *                      '-----------. ,--------------------'
 *                                   v
 *                                 (End)
 * ```
 *
 * Note: by assuming that maxDuration is greater than VALIDATION_DELAY, we are sure that if the
 * process is still alive after maxDuration, it has been validated.
 */
function waitPageActivityEnd(lifeCycle, domMutationObservable, configuration, pageActivityEndCallback, maxDuration) {
    var pageActivityObservable = createPageActivityObservable(lifeCycle, domMutationObservable, configuration);
    return doWaitPageActivityEnd(pageActivityObservable, pageActivityEndCallback, maxDuration);
}
function doWaitPageActivityEnd(pageActivityObservable, pageActivityEndCallback, maxDuration) {
    var pageActivityEndTimeoutId;
    var hasCompleted = false;
    var validationTimeoutId = (0, browser_core_1.setTimeout)((0, browser_core_1.monitor)(function () { return complete({ hadActivity: false }); }), exports.PAGE_ACTIVITY_VALIDATION_DELAY);
    var maxDurationTimeoutId = maxDuration !== undefined
        ? (0, browser_core_1.setTimeout)((0, browser_core_1.monitor)(function () { return complete({ hadActivity: true, end: (0, browser_core_1.timeStampNow)() }); }), maxDuration)
        : undefined;
    var pageActivitySubscription = pageActivityObservable.subscribe(function (_a) {
        var isBusy = _a.isBusy;
        (0, browser_core_1.clearTimeout)(validationTimeoutId);
        (0, browser_core_1.clearTimeout)(pageActivityEndTimeoutId);
        var lastChangeTime = (0, browser_core_1.timeStampNow)();
        if (!isBusy) {
            pageActivityEndTimeoutId = (0, browser_core_1.setTimeout)((0, browser_core_1.monitor)(function () { return complete({ hadActivity: true, end: lastChangeTime }); }), exports.PAGE_ACTIVITY_END_DELAY);
        }
    });
    var stop = function () {
        hasCompleted = true;
        (0, browser_core_1.clearTimeout)(validationTimeoutId);
        (0, browser_core_1.clearTimeout)(pageActivityEndTimeoutId);
        (0, browser_core_1.clearTimeout)(maxDurationTimeoutId);
        pageActivitySubscription.unsubscribe();
    };
    function complete(event) {
        if (hasCompleted) {
            return;
        }
        stop();
        pageActivityEndCallback(event);
    }
    return { stop: stop };
}
function createPageActivityObservable(lifeCycle, domMutationObservable, configuration) {
    return new browser_core_1.Observable(function (observable) {
        var subscriptions = [];
        var firstRequestIndex;
        var pendingRequestsCount = 0;
        subscriptions.push(domMutationObservable.subscribe(notifyPageActivity), lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
            if (entries.some(function (entry) { return entry.entryType === performanceCollection_1.RumPerformanceEntryType.RESOURCE && !isExcludedUrl(configuration, entry.name); })) {
                notifyPageActivity();
            }
        }), lifeCycle.subscribe(7 /* LifeCycleEventType.REQUEST_STARTED */, function (startEvent) {
            if (isExcludedUrl(configuration, startEvent.url)) {
                return;
            }
            if (firstRequestIndex === undefined) {
                firstRequestIndex = startEvent.requestIndex;
            }
            pendingRequestsCount += 1;
            notifyPageActivity();
        }), lifeCycle.subscribe(8 /* LifeCycleEventType.REQUEST_COMPLETED */, function (request) {
            if (isExcludedUrl(configuration, request.url) ||
                firstRequestIndex === undefined ||
                // If the request started before the tracking start, ignore it
                request.requestIndex < firstRequestIndex) {
                return;
            }
            pendingRequestsCount -= 1;
            notifyPageActivity();
        }));
        var stopTrackingWindowOpen = trackWindowOpen(notifyPageActivity).stop;
        return function () {
            stopTrackingWindowOpen();
            subscriptions.forEach(function (s) { return s.unsubscribe(); });
        };
        function notifyPageActivity() {
            observable.notify({ isBusy: pendingRequestsCount > 0 });
        }
    });
}
function isExcludedUrl(configuration, requestUrl) {
    return (0, browser_core_1.matchList)(configuration.excludedActivityUrls, requestUrl);
}
function trackWindowOpen(callback) {
    return (0, browser_core_1.instrumentMethod)(window, 'open', callback);
}
//# sourceMappingURL=waitPageActivityEnd.js.map