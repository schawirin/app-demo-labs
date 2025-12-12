"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocationChangeObservable = createLocationChangeObservable;
var browser_core_1 = require("@datadog/browser-core");
function createLocationChangeObservable(configuration, location) {
    var currentLocation = (0, browser_core_1.shallowClone)(location);
    return new browser_core_1.Observable(function (observable) {
        var stopHistoryTracking = trackHistory(configuration, onLocationChange).stop;
        var stopHashTracking = trackHash(configuration, onLocationChange).stop;
        function onLocationChange() {
            if (currentLocation.href === location.href) {
                return;
            }
            var newLocation = (0, browser_core_1.shallowClone)(location);
            observable.notify({
                newLocation: newLocation,
                oldLocation: currentLocation,
            });
            currentLocation = newLocation;
        }
        return function () {
            stopHistoryTracking();
            stopHashTracking();
        };
    });
}
function trackHistory(configuration, onHistoryChange) {
    var stopInstrumentingPushState = (0, browser_core_1.instrumentMethod)(history, 'pushState', function (_a) {
        var onPostCall = _a.onPostCall;
        onPostCall(onHistoryChange);
    }).stop;
    var stopInstrumentingReplaceState = (0, browser_core_1.instrumentMethod)(history, 'replaceState', function (_a) {
        var onPostCall = _a.onPostCall;
        onPostCall(onHistoryChange);
    }).stop;
    var removeListener = (0, browser_core_1.addEventListener)(configuration, window, browser_core_1.DOM_EVENT.POP_STATE, onHistoryChange).stop;
    return {
        stop: function () {
            stopInstrumentingPushState();
            stopInstrumentingReplaceState();
            removeListener();
        },
    };
}
function trackHash(configuration, onHashChange) {
    return (0, browser_core_1.addEventListener)(configuration, window, browser_core_1.DOM_EVENT.HASH_CHANGE, onHashChange);
}
//# sourceMappingURL=locationChangeObservable.js.map