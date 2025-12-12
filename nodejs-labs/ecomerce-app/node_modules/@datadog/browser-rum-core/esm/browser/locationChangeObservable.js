import { addEventListener, DOM_EVENT, instrumentMethod, Observable, shallowClone } from '@datadog/browser-core';
export function createLocationChangeObservable(configuration, location) {
    var currentLocation = shallowClone(location);
    return new Observable(function (observable) {
        var stopHistoryTracking = trackHistory(configuration, onLocationChange).stop;
        var stopHashTracking = trackHash(configuration, onLocationChange).stop;
        function onLocationChange() {
            if (currentLocation.href === location.href) {
                return;
            }
            var newLocation = shallowClone(location);
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
    var stopInstrumentingPushState = instrumentMethod(history, 'pushState', function (_a) {
        var onPostCall = _a.onPostCall;
        onPostCall(onHistoryChange);
    }).stop;
    var stopInstrumentingReplaceState = instrumentMethod(history, 'replaceState', function (_a) {
        var onPostCall = _a.onPostCall;
        onPostCall(onHistoryChange);
    }).stop;
    var removeListener = addEventListener(configuration, window, DOM_EVENT.POP_STATE, onHistoryChange).stop;
    return {
        stop: function () {
            stopInstrumentingPushState();
            stopInstrumentingReplaceState();
            removeListener();
        },
    };
}
function trackHash(configuration, onHashChange) {
    return addEventListener(configuration, window, DOM_EVENT.HASH_CHANGE, onHashChange);
}
//# sourceMappingURL=locationChangeObservable.js.map