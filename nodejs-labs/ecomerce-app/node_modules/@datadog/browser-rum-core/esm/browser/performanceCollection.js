import { dateNow, assign, addEventListeners, DOM_EVENT, getRelativeTime, isNumber, monitor, setTimeout, relativeNow, runOnReadyState, addEventListener, objectHasValue, } from '@datadog/browser-core';
import { FAKE_INITIAL_DOCUMENT, isAllowedRequestUrl } from '../domain/resource/resourceUtils';
import { getDocumentTraceId } from '../domain/tracing/getDocumentTraceId';
// We want to use a real enum (i.e. not a const enum) here, to be able to check whether an arbitrary
// string is an expected performance entry
// eslint-disable-next-line no-restricted-syntax
export var RumPerformanceEntryType;
(function (RumPerformanceEntryType) {
    RumPerformanceEntryType["EVENT"] = "event";
    RumPerformanceEntryType["FIRST_INPUT"] = "first-input";
    RumPerformanceEntryType["LARGEST_CONTENTFUL_PAINT"] = "largest-contentful-paint";
    RumPerformanceEntryType["LAYOUT_SHIFT"] = "layout-shift";
    RumPerformanceEntryType["LONG_TASK"] = "longtask";
    RumPerformanceEntryType["NAVIGATION"] = "navigation";
    RumPerformanceEntryType["PAINT"] = "paint";
    RumPerformanceEntryType["RESOURCE"] = "resource";
})(RumPerformanceEntryType || (RumPerformanceEntryType = {}));
function supportPerformanceObject() {
    return window.performance !== undefined && 'getEntries' in performance;
}
export function supportPerformanceTimingEvent(entryType) {
    return (window.PerformanceObserver &&
        PerformanceObserver.supportedEntryTypes !== undefined &&
        PerformanceObserver.supportedEntryTypes.includes(entryType));
}
export function startPerformanceCollection(lifeCycle, configuration) {
    var cleanupTasks = [];
    retrieveInitialDocumentResourceTiming(configuration, function (timing) {
        handleRumPerformanceEntries(lifeCycle, configuration, [timing]);
    });
    if (supportPerformanceObject()) {
        var performanceEntries_1 = performance.getEntries();
        // Because the performance entry list can be quite large
        // delay the computation to prevent the SDK from blocking the main thread on init
        setTimeout(function () { return handleRumPerformanceEntries(lifeCycle, configuration, performanceEntries_1); });
    }
    if (window.PerformanceObserver) {
        var handlePerformanceEntryList_1 = monitor(function (entries) {
            return handleRumPerformanceEntries(lifeCycle, configuration, entries.getEntries());
        });
        var mainEntries = [
            RumPerformanceEntryType.RESOURCE,
            RumPerformanceEntryType.NAVIGATION,
            RumPerformanceEntryType.LONG_TASK,
            RumPerformanceEntryType.PAINT,
        ];
        var experimentalEntries = [
            RumPerformanceEntryType.LARGEST_CONTENTFUL_PAINT,
            RumPerformanceEntryType.FIRST_INPUT,
            RumPerformanceEntryType.LAYOUT_SHIFT,
            RumPerformanceEntryType.EVENT,
        ];
        try {
            // Experimental entries are not retrieved by performance.getEntries()
            // use a single PerformanceObserver with buffered flag by type
            // to get values that could happen before SDK init
            experimentalEntries.forEach(function (type) {
                var observer = new window.PerformanceObserver(handlePerformanceEntryList_1);
                observer.observe({
                    type: type,
                    buffered: true,
                    // durationThreshold only impact PerformanceEventTiming entries used for INP computation which requires a threshold at 40 (default is 104ms)
                    // cf: https://github.com/GoogleChrome/web-vitals/blob/3806160ffbc93c3c4abf210a167b81228172b31c/src/onINP.ts#L209
                    durationThreshold: 40,
                });
                cleanupTasks.push(function () { return observer.disconnect(); });
            });
        }
        catch (e) {
            // Some old browser versions (ex: chrome 67) don't support the PerformanceObserver type and buffered options
            // In these cases, fallback to PerformanceObserver with entryTypes
            mainEntries.push.apply(mainEntries, experimentalEntries);
        }
        var mainObserver_1 = new PerformanceObserver(handlePerformanceEntryList_1);
        mainObserver_1.observe({ entryTypes: mainEntries });
        cleanupTasks.push(function () { return mainObserver_1.disconnect(); });
        if (supportPerformanceObject() && 'addEventListener' in performance) {
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1559377
            var removePerformanceListener = addEventListener(configuration, performance, 'resourcetimingbufferfull', function () {
                performance.clearResourceTimings();
            }).stop;
            cleanupTasks.push(removePerformanceListener);
        }
    }
    if (!supportPerformanceTimingEvent(RumPerformanceEntryType.NAVIGATION)) {
        retrieveNavigationTiming(configuration, function (timing) {
            handleRumPerformanceEntries(lifeCycle, configuration, [timing]);
        });
    }
    if (!supportPerformanceTimingEvent(RumPerformanceEntryType.FIRST_INPUT)) {
        var stopFirstInputTiming = retrieveFirstInputTiming(configuration, function (timing) {
            handleRumPerformanceEntries(lifeCycle, configuration, [timing]);
        }).stop;
        cleanupTasks.push(stopFirstInputTiming);
    }
    return {
        stop: function () {
            cleanupTasks.forEach(function (task) { return task(); });
        },
    };
}
export function retrieveInitialDocumentResourceTiming(configuration, callback) {
    runOnReadyState(configuration, 'interactive', function () {
        var timing;
        var forcedAttributes = {
            entryType: RumPerformanceEntryType.RESOURCE,
            initiatorType: FAKE_INITIAL_DOCUMENT,
            traceId: getDocumentTraceId(document),
            toJSON: function () { return assign({}, timing, { toJSON: undefined }); },
        };
        if (supportPerformanceTimingEvent(RumPerformanceEntryType.NAVIGATION) &&
            performance.getEntriesByType(RumPerformanceEntryType.NAVIGATION).length > 0) {
            var navigationEntry = performance.getEntriesByType(RumPerformanceEntryType.NAVIGATION)[0];
            timing = assign(navigationEntry.toJSON(), forcedAttributes);
        }
        else {
            var relativePerformanceTiming = computeRelativePerformanceTiming();
            timing = assign(relativePerformanceTiming, {
                decodedBodySize: 0,
                encodedBodySize: 0,
                transferSize: 0,
                renderBlockingStatus: 'non-blocking',
                duration: relativePerformanceTiming.responseEnd,
                name: window.location.href,
                startTime: 0,
            }, forcedAttributes);
        }
        callback(timing);
    });
}
function retrieveNavigationTiming(configuration, callback) {
    function sendFakeTiming() {
        callback(assign(computeRelativePerformanceTiming(), {
            entryType: RumPerformanceEntryType.NAVIGATION,
        }));
    }
    runOnReadyState(configuration, 'complete', function () {
        // Send it a bit after the actual load event, so the "loadEventEnd" timing is accurate
        setTimeout(sendFakeTiming);
    });
}
/**
 * first-input timing entry polyfill based on
 * https://github.com/GoogleChrome/web-vitals/blob/master/src/lib/polyfills/firstInputPolyfill.ts
 */
function retrieveFirstInputTiming(configuration, callback) {
    var startTimeStamp = dateNow();
    var timingSent = false;
    var removeEventListeners = addEventListeners(configuration, window, [DOM_EVENT.CLICK, DOM_EVENT.MOUSE_DOWN, DOM_EVENT.KEY_DOWN, DOM_EVENT.TOUCH_START, DOM_EVENT.POINTER_DOWN], function (evt) {
        // Only count cancelable events, which should trigger behavior important to the user.
        if (!evt.cancelable) {
            return;
        }
        // This timing will be used to compute the "first Input delay", which is the delta between
        // when the system received the event (e.g. evt.timeStamp) and when it could run the callback
        // (e.g. performance.now()).
        var timing = {
            entryType: RumPerformanceEntryType.FIRST_INPUT,
            processingStart: relativeNow(),
            processingEnd: relativeNow(),
            startTime: evt.timeStamp,
            duration: 0, // arbitrary value to avoid nullable duration and simplify INP logic
            name: '',
        };
        if (evt.type === DOM_EVENT.POINTER_DOWN) {
            sendTimingIfPointerIsNotCancelled(configuration, timing);
        }
        else {
            sendTiming(timing);
        }
    }, { passive: true, capture: true }).stop;
    return { stop: removeEventListeners };
    /**
     * Pointer events are a special case, because they can trigger main or compositor thread behavior.
     * We differentiate these cases based on whether or not we see a pointercancel event, which are
     * fired when we scroll. If we're scrolling we don't need to report input delay since FID excludes
     * scrolling and pinch/zooming.
     */
    function sendTimingIfPointerIsNotCancelled(configuration, timing) {
        addEventListeners(configuration, window, [DOM_EVENT.POINTER_UP, DOM_EVENT.POINTER_CANCEL], function (event) {
            if (event.type === DOM_EVENT.POINTER_UP) {
                sendTiming(timing);
            }
        }, { once: true });
    }
    function sendTiming(timing) {
        if (!timingSent) {
            timingSent = true;
            removeEventListeners();
            // In some cases the recorded delay is clearly wrong, e.g. it's negative or it's larger than
            // the time between now and when the page was loaded.
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/4
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/6
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/7
            var delay = timing.processingStart - timing.startTime;
            if (delay >= 0 && delay < dateNow() - startTimeStamp) {
                callback(timing);
            }
        }
    }
}
function computeRelativePerformanceTiming() {
    var result = {};
    var timing = performance.timing;
    for (var key in timing) {
        if (isNumber(timing[key])) {
            var numberKey = key;
            var timingElement = timing[numberKey];
            result[numberKey] = timingElement === 0 ? 0 : getRelativeTime(timingElement);
        }
    }
    return result;
}
function handleRumPerformanceEntries(lifeCycle, configuration, entries) {
    var rumPerformanceEntries = entries.filter(function (entry) {
        return objectHasValue(RumPerformanceEntryType, entry.entryType);
    });
    var rumAllowedPerformanceEntries = rumPerformanceEntries.filter(function (entry) { return !isIncompleteNavigation(entry) && !isForbiddenResource(configuration, entry); });
    if (rumAllowedPerformanceEntries.length) {
        lifeCycle.notify(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, rumAllowedPerformanceEntries);
    }
}
function isIncompleteNavigation(entry) {
    return entry.entryType === RumPerformanceEntryType.NAVIGATION && entry.loadEventEnd <= 0;
}
function isForbiddenResource(configuration, entry) {
    return entry.entryType === RumPerformanceEntryType.RESOURCE && !isAllowedRequestUrl(configuration, entry.name);
}
//# sourceMappingURL=performanceCollection.js.map