import { trackCumulativeLayoutShift } from './trackCumulativeLayoutShift';
import { trackInteractionToNextPaint } from './trackInteractionToNextPaint';
import { trackLoadingTime } from './trackLoadingTime';
import { trackScrollMetrics } from './trackScrollMetrics';
export function trackCommonViewMetrics(lifeCycle, domMutationObservable, configuration, scheduleViewUpdate, loadingType, viewStart) {
    var commonViewMetrics = {};
    var _a = trackLoadingTime(lifeCycle, domMutationObservable, configuration, loadingType, viewStart, function (newLoadingTime) {
        commonViewMetrics.loadingTime = newLoadingTime;
        scheduleViewUpdate();
    }), stopLoadingTimeTracking = _a.stop, setLoadEvent = _a.setLoadEvent;
    var stopScrollMetricsTracking = trackScrollMetrics(configuration, viewStart, function (newScrollMetrics) {
        commonViewMetrics.scroll = newScrollMetrics;
    }).stop;
    var stopCLSTracking = trackCumulativeLayoutShift(configuration, lifeCycle, viewStart.relative, function (cumulativeLayoutShift) {
        commonViewMetrics.cumulativeLayoutShift = cumulativeLayoutShift;
        scheduleViewUpdate();
    }).stop;
    var _b = trackInteractionToNextPaint(configuration, viewStart.relative, loadingType, lifeCycle), stopINPTracking = _b.stop, getInteractionToNextPaint = _b.getInteractionToNextPaint, setViewEnd = _b.setViewEnd;
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