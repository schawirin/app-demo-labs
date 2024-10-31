import { elapsed } from '@datadog/browser-core';
import { waitPageActivityEnd } from '../../waitPageActivityEnd';
export function trackLoadingTime(lifeCycle, domMutationObservable, configuration, loadType, viewStart, callback) {
    var isWaitingForLoadEvent = loadType === "initial_load" /* ViewLoadingType.INITIAL_LOAD */;
    var isWaitingForActivityLoadingTime = true;
    var loadingTimeCandidates = [];
    function invokeCallbackIfAllCandidatesAreReceived() {
        if (!isWaitingForActivityLoadingTime && !isWaitingForLoadEvent && loadingTimeCandidates.length > 0) {
            callback(Math.max.apply(Math, loadingTimeCandidates));
        }
    }
    var stop = waitPageActivityEnd(lifeCycle, domMutationObservable, configuration, function (event) {
        if (isWaitingForActivityLoadingTime) {
            isWaitingForActivityLoadingTime = false;
            if (event.hadActivity) {
                loadingTimeCandidates.push(elapsed(viewStart.timeStamp, event.end));
            }
            invokeCallbackIfAllCandidatesAreReceived();
        }
    }).stop;
    return {
        stop: stop,
        setLoadEvent: function (loadEvent) {
            if (isWaitingForLoadEvent) {
                isWaitingForLoadEvent = false;
                loadingTimeCandidates.push(loadEvent);
                invokeCallbackIfAllCandidatesAreReceived();
            }
        },
    };
}
//# sourceMappingURL=trackLoadingTime.js.map