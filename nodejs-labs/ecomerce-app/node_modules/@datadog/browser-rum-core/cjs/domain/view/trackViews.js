"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEEP_TRACKING_AFTER_VIEW_DELAY = exports.SESSION_KEEP_ALIVE_INTERVAL = exports.THROTTLE_VIEW_UPDATE_PERIOD = void 0;
exports.trackViews = trackViews;
var browser_core_1 = require("@datadog/browser-core");
var trackViewEventCounts_1 = require("./trackViewEventCounts");
var trackInitialViewMetrics_1 = require("./viewMetrics/trackInitialViewMetrics");
var trackCommonViewMetrics_1 = require("./viewMetrics/trackCommonViewMetrics");
exports.THROTTLE_VIEW_UPDATE_PERIOD = 3000;
exports.SESSION_KEEP_ALIVE_INTERVAL = 5 * browser_core_1.ONE_MINUTE;
// Some events or metrics can be captured after the end of the view. To avoid missing those;
// an arbitrary delay is added for stopping their tracking after the view ends.
//
// Ideally, we would not stop and keep tracking events or metrics until the end of the session.
// But this might have a small performance impact if there are many many views.
// So let's have a fairly short delay improving the situation in most cases and avoid impacting performances too much.
exports.KEEP_TRACKING_AFTER_VIEW_DELAY = 5 * browser_core_1.ONE_MINUTE;
function trackViews(location, lifeCycle, domMutationObservable, configuration, locationChangeObservable, areViewsTrackedAutomatically, initialViewOptions) {
    var activeViews = new Set();
    var currentView = startNewView("initial_load" /* ViewLoadingType.INITIAL_LOAD */, (0, browser_core_1.clocksOrigin)(), initialViewOptions);
    startViewLifeCycle();
    var locationChangeSubscription;
    if (areViewsTrackedAutomatically) {
        locationChangeSubscription = renewViewOnLocationChange(locationChangeObservable);
    }
    function startNewView(loadingType, startClocks, viewOptions) {
        var newlyCreatedView = newView(lifeCycle, domMutationObservable, configuration, location, loadingType, startClocks, viewOptions);
        activeViews.add(newlyCreatedView);
        newlyCreatedView.stopObservable.subscribe(function () {
            activeViews.delete(newlyCreatedView);
        });
        return newlyCreatedView;
    }
    function startViewLifeCycle() {
        lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, function () {
            // Renew view on session renewal
            currentView = startNewView("route_change" /* ViewLoadingType.ROUTE_CHANGE */, undefined, {
                name: currentView.name,
                service: currentView.service,
                version: currentView.version,
            });
        });
        lifeCycle.subscribe(9 /* LifeCycleEventType.SESSION_EXPIRED */, function () {
            currentView.end({ sessionIsActive: false });
        });
        // End the current view on page unload
        lifeCycle.subscribe(11 /* LifeCycleEventType.PAGE_EXITED */, function (pageExitEvent) {
            if (pageExitEvent.reason === browser_core_1.PageExitReason.UNLOADING) {
                currentView.end();
            }
        });
    }
    function renewViewOnLocationChange(locationChangeObservable) {
        return locationChangeObservable.subscribe(function (_a) {
            var oldLocation = _a.oldLocation, newLocation = _a.newLocation;
            if (areDifferentLocation(oldLocation, newLocation)) {
                currentView.end();
                currentView = startNewView("route_change" /* ViewLoadingType.ROUTE_CHANGE */);
            }
        });
    }
    return {
        addTiming: function (name, time) {
            if (time === void 0) { time = (0, browser_core_1.timeStampNow)(); }
            currentView.addTiming(name, time);
        },
        startView: function (options, startClocks) {
            currentView.end({ endClocks: startClocks });
            currentView = startNewView("route_change" /* ViewLoadingType.ROUTE_CHANGE */, startClocks, options);
        },
        stop: function () {
            locationChangeSubscription === null || locationChangeSubscription === void 0 ? void 0 : locationChangeSubscription.unsubscribe();
            currentView.end();
            activeViews.forEach(function (view) { return view.stop(); });
        },
    };
}
function newView(lifeCycle, domMutationObservable, configuration, initialLocation, loadingType, startClocks, viewOptions) {
    if (startClocks === void 0) { startClocks = (0, browser_core_1.clocksNow)(); }
    // Setup initial values
    var id = (0, browser_core_1.generateUUID)();
    var stopObservable = new browser_core_1.Observable();
    var customTimings = {};
    var documentVersion = 0;
    var endClocks;
    var location = (0, browser_core_1.shallowClone)(initialLocation);
    var sessionIsActive = true;
    var name;
    var service;
    var version;
    if (viewOptions) {
        name = viewOptions.name;
        service = viewOptions.service || undefined;
        version = viewOptions.version || undefined;
    }
    var viewCreatedEvent = {
        id: id,
        name: name,
        startClocks: startClocks,
        service: service,
        version: version,
    };
    lifeCycle.notify(2 /* LifeCycleEventType.BEFORE_VIEW_CREATED */, viewCreatedEvent);
    lifeCycle.notify(3 /* LifeCycleEventType.VIEW_CREATED */, viewCreatedEvent);
    // Update the view every time the measures are changing
    var _a = (0, browser_core_1.throttle)(triggerViewUpdate, exports.THROTTLE_VIEW_UPDATE_PERIOD, {
        leading: false,
    }), scheduleViewUpdate = _a.throttled, cancelScheduleViewUpdate = _a.cancel;
    var _b = (0, trackCommonViewMetrics_1.trackCommonViewMetrics)(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, startClocks), setLoadEvent = _b.setLoadEvent, setViewEnd = _b.setViewEnd, stopCommonViewMetricsTracking = _b.stop, stopINPTracking = _b.stopINPTracking, getCommonViewMetrics = _b.getCommonViewMetrics;
    var _c = loadingType === "initial_load" /* ViewLoadingType.INITIAL_LOAD */
        ? (0, trackInitialViewMetrics_1.trackInitialViewMetrics)(lifeCycle, configuration, setLoadEvent, scheduleViewUpdate)
        : { stop: browser_core_1.noop, initialViewMetrics: {} }, stopInitialViewMetricsTracking = _c.stop, initialViewMetrics = _c.initialViewMetrics;
    var _d = (0, trackViewEventCounts_1.trackViewEventCounts)(lifeCycle, id, scheduleViewUpdate), stopEventCountsTracking = _d.stop, eventCounts = _d.eventCounts;
    // Session keep alive
    var keepAliveIntervalId = (0, browser_core_1.setInterval)(triggerViewUpdate, exports.SESSION_KEEP_ALIVE_INTERVAL);
    // Initial view update
    triggerViewUpdate();
    function triggerViewUpdate() {
        cancelScheduleViewUpdate();
        documentVersion += 1;
        var currentEnd = endClocks === undefined ? (0, browser_core_1.timeStampNow)() : endClocks.timeStamp;
        lifeCycle.notify(4 /* LifeCycleEventType.VIEW_UPDATED */, {
            customTimings: customTimings,
            documentVersion: documentVersion,
            id: id,
            name: name,
            service: service,
            version: version,
            loadingType: loadingType,
            location: location,
            startClocks: startClocks,
            commonViewMetrics: getCommonViewMetrics(),
            initialViewMetrics: initialViewMetrics,
            duration: (0, browser_core_1.elapsed)(startClocks.timeStamp, currentEnd),
            isActive: endClocks === undefined,
            sessionIsActive: sessionIsActive,
            eventCounts: eventCounts,
        });
    }
    return {
        name: name,
        service: service,
        version: version,
        stopObservable: stopObservable,
        end: function (options) {
            var _this = this;
            var _a, _b;
            if (options === void 0) { options = {}; }
            if (endClocks) {
                // view already ended
                return;
            }
            endClocks = (_a = options.endClocks) !== null && _a !== void 0 ? _a : (0, browser_core_1.clocksNow)();
            sessionIsActive = (_b = options.sessionIsActive) !== null && _b !== void 0 ? _b : true;
            lifeCycle.notify(5 /* LifeCycleEventType.VIEW_ENDED */, { endClocks: endClocks });
            lifeCycle.notify(6 /* LifeCycleEventType.AFTER_VIEW_ENDED */, { endClocks: endClocks });
            (0, browser_core_1.clearInterval)(keepAliveIntervalId);
            setViewEnd(endClocks.relative);
            stopCommonViewMetricsTracking();
            triggerViewUpdate();
            (0, browser_core_1.setTimeout)(function () {
                _this.stop();
            }, exports.KEEP_TRACKING_AFTER_VIEW_DELAY);
        },
        stop: function () {
            stopInitialViewMetricsTracking();
            stopEventCountsTracking();
            stopINPTracking();
            stopObservable.notify();
        },
        addTiming: function (name, time) {
            if (endClocks) {
                return;
            }
            var relativeTime = (0, browser_core_1.looksLikeRelativeTime)(time) ? time : (0, browser_core_1.elapsed)(startClocks.timeStamp, time);
            customTimings[sanitizeTiming(name)] = relativeTime;
            scheduleViewUpdate();
        },
    };
}
/**
 * Timing name is used as facet path that must contain only letters, digits, or the characters - _ . @ $
 */
function sanitizeTiming(name) {
    var sanitized = name.replace(/[^a-zA-Z0-9-_.@$]/g, '_');
    if (sanitized !== name) {
        browser_core_1.display.warn("Invalid timing name: ".concat(name, ", sanitized to: ").concat(sanitized));
    }
    return sanitized;
}
function areDifferentLocation(currentLocation, otherLocation) {
    return (currentLocation.pathname !== otherLocation.pathname ||
        (!isHashAnAnchor(otherLocation.hash) &&
            getPathFromHash(otherLocation.hash) !== getPathFromHash(currentLocation.hash)));
}
function isHashAnAnchor(hash) {
    var correspondingId = hash.substring(1);
    // check if the correspondingId is empty because on Firefox an empty string passed to getElementById() prints a consol warning
    return correspondingId !== '' && !!document.getElementById(correspondingId);
}
function getPathFromHash(hash) {
    var index = hash.indexOf('?');
    return index < 0 ? hash : hash.slice(0, index);
}
//# sourceMappingURL=trackViews.js.map