"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackCommonViewMetrics = trackCommonViewMetrics;
var trackCumulativeLayoutShift_1 = require("./trackCumulativeLayoutShift");
var trackInteractionToNextPaint_1 = require("./trackInteractionToNextPaint");
var trackLoadingTime_1 = require("./trackLoadingTime");
var trackScrollMetrics_1 = require("./trackScrollMetrics");
function trackCommonViewMetrics(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, viewStart) {
    var commonViewMetrics = {};
    var _a = (0, trackLoadingTime_1.trackLoadingTime)(lifeCycle, domMutationObservable, configuration, loadingType, viewStart, function (newLoadingTime) {
        commonViewMetrics.loadingTime = newLoadingTime;
        scheduleViewUpdate();
    }), stopLoadingTimeTracking = _a.stop, setLoadEvent = _a.setLoadEvent;
    var stopScrollMetricsTracking = (0, trackScrollMetrics_1.trackScrollMetrics)(configuration, viewStart, function (newScrollMetrics) {
        commonViewMetrics.scroll = newScrollMetrics;
    }).stop;
    var stopCLSTracking = (0, trackCumulativeLayoutShift_1.trackCumulativeLayoutShift)(configuration, lifeCycle, viewStart.relative, function (cumulativeLayoutShift) {
        commonViewMetrics.cumulativeLayoutShift = cumulativeLayoutShift;
        scheduleViewUpdate();
    }).stop;
    var _b = (0, trackInteractionToNextPaint_1.trackInteractionToNextPaint)(configuration, viewStart.relative, loadingType, lifeCycle), stopINPTracking = _b.stop, getInteractionToNextPaint = _b.getInteractionToNextPaint, setViewEnd = _b.setViewEnd;
    return {
        stop: function () {
            stopLoadingTimeTracking();
            stopCLSTracking();
            stopScrollMetricsTracking();
        },
        stopINPTracking: stopINPTracking,
        setLoadEvent: setLoadEvent,
        setViewEnd: setViewEnd,
        getCommonViewMetrics: function () {
            commonViewMetrics.interactionToNextPaint = getInteractionToNextPaint();
            return commonViewMetrics;
        },
    };
}
//# sourceMappingURL=trackCommonViewMetrics.js.map