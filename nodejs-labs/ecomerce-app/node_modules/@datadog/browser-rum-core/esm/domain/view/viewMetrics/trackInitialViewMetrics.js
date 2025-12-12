import { trackFirstContentfulPaint } from './trackFirstContentfulPaint';
import { trackFirstInput } from './trackFirstInput';
import { trackNavigationTimings } from './trackNavigationTimings';
import { trackLargestContentfulPaint } from './trackLargestContentfulPaint';
import { trackFirstHidden } from './trackFirstHidden';
export function trackInitialViewMetrics(lifeCycle, configuration, setLoadEvent, scheduleViewUpdate) {
    var initialViewMetrics = {};
    var stopNavigationTracking = trackNavigationTimings(lifeCycle, function (navigationTimings) {
        setLoadEvent(navigationTimings.loadEvent);
        initialViewMetrics.navigationTimings = navigationTimings;
        scheduleViewUpdate();
    }).stop;
    var firstHidden = trackFirstHidden(configuration);
    var stopFCPTracking = trackFirstContentfulPaint(lifeCycle, firstHidden, function (firstContentfulPaint) {
        initialViewMetrics.firstContentfulPaint = firstContentfulPaint;
        scheduleViewUpdate();
    }).stop;
    var stopLCPTracking = trackLargestContentfulPaint(lifeCycle, configuration, firstHidden, window, function (largestContentfulPaint) {
        initialViewMetrics.largestContentfulPaint = largestContentfulPaint;
        scheduleViewUpdate();
    }).stop;
    var stopFIDTracking = trackFirstInput(lifeCycle, configuration, firstHidden, function (firstInput) {
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