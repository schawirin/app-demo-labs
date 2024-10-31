"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackInitialViewMetrics = trackInitialViewMetrics;
var trackFirstContentfulPaint_1 = require("./trackFirstContentfulPaint");
var trackFirstInput_1 = require("./trackFirstInput");
var trackNavigationTimings_1 = require("./trackNavigationTimings");
var trackLargestContentfulPaint_1 = require("./trackLargestContentfulPaint");
var trackFirstHidden_1 = require("./trackFirstHidden");
function trackInitialViewMetrics(lifeCycle, configuration, setLoadEvent, scheduleViewUpdate) {
    var initialViewMetrics = {};
    var stopNavigationTracking = (0, trackNavigationTimings_1.trackNavigationTimings)(lifeCycle, function (navigationTimings) {
        setLoadEvent(navigationTimings.loadEvent);
        initialViewMetrics.navigationTimings = navigationTimings;
        scheduleViewUpdate();
    }).stop;
    var firstHidden = (0, trackFirstHidden_1.trackFirstHidden)(configuration);
    var stopFCPTracking = (0, trackFirstContentfulPaint_1.trackFirstContentfulPaint)(lifeCycle, firstHidden, function (firstContentfulPaint) {
        initialViewMetrics.firstContentfulPaint = firstContentfulPaint;
        scheduleViewUpdate();
    }).stop;
    var stopLCPTracking = (0, trackLargestContentfulPaint_1.trackLargestContentfulPaint)(lifeCycle, configuration, firstHidden, window, function (largestContentfulPaint) {
        initialViewMetrics.largestContentfulPaint = largestContentfulPaint;
        scheduleViewUpdate();
    }).stop;
    var stopFIDTracking = (0, trackFirstInput_1.trackFirstInput)(lifeCycle, configuration, firstHidden, function (firstInput) {
        initialViewMetrics.firstInput = firstInput;
        scheduleViewUpdate();
    }).stop;
    function stop() {
        stopNavigationTracking();
        stopFCPTracking();
        stopLCPTracking();
        stopFIDTracking();
        firstHidden.stop();
    }
    return {
        stop: stop,
        initialViewMetrics: initialViewMetrics,
    };
}
//# sourceMappingURL=trackInitialViewMetrics.js.map