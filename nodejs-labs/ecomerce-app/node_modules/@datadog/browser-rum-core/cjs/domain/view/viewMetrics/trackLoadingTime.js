"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackLoadingTime = trackLoadingTime;
var browser_core_1 = require("@datadog/browser-core");
var waitPageActivityEnd_1 = require("../../waitPageActivityEnd");
function trackLoadingTime(lifeCycle, domMutationObservable, configuration, loadType, viewStart, callback) {
    var isWaitingForLoadEvent = loadType === "initial_load" /* ViewLoadingType.INITIAL_LOAD */;
    var isWaitingForActivityLoadingTime = true;
    var loadingTimeCandidates = [];
    function invokeCallbackIfAllCandidatesAreReceived() {
        if (!isWaitingForActivityLoadingTime && !isWaitingForLoadEvent && loadingTimeCandidates.length > 0) {
            callback(Math.max.apply(Math, loadingTimeCandidates));
        }
    }
    var stop = (0, waitPageActivityEnd_1.waitPageActivityEnd)(lifeCycle, domMutationObservable, configuration, function (event) {
        if (isWaitingForActivityLoadingTime) {
            isWaitingForActivityLoadingTime = false;
            if (event.hadActivity) {
                loadingTimeCandidates.push((0, browser_core_1.elapsed)(viewStart.timeStamp, event.end));
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