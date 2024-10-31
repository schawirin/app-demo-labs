import { setInterval, clearInterval, Observable, addEventListener, ONE_SECOND, findCommaSeparatedValue, DOM_EVENT, find, } from '@datadog/browser-core';
export function createCookieObservable(configuration, cookieName) {
    var detectCookieChangeStrategy = window.cookieStore
        ? listenToCookieStoreChange(configuration)
        : watchCookieFallback;
    return new Observable(function (observable) {
        return detectCookieChangeStrategy(cookieName, function (event) { return observable.notify(event); });
    });
}
function listenToCookieStoreChange(configuration) {
    return function (cookieName, callback) {
        var listener = addEventListener(configuration, window.cookieStore, DOM_EVENT.CHANGE, function (event) {
            // Based on our experimentation, we're assuming that entries for the same cookie cannot be in both the 'changed' and 'deleted' arrays.
            // However, due to ambiguity in the specification, we asked for clarification: https://github.com/WICG/cookie-store/issues/226
            var changeEvent = find(event.changed, function (event) { return event.name === cookieName; }) ||
                find(event.deleted, function (event) { return event.name === cookieName; });
            if (changeEvent) {
                callback(changeEvent.value);
            }
        });
        return listener.stop;
    };
}
export var WATCH_COOKIE_INTERVAL_DELAY = ONE_SECOND;
function watchCookieFallback(cookieName, callback) {
    var previousCookieValue = findCommaSeparatedValue(document.cookie, cookieName);
    var watchCookieIntervalId = setInterval(function () {
        var cookieValue = findCommaSeparatedValue(document.cookie, cookieName);
        if (cookieValue !== previousCookieValue) {
            callback(cookieValue);
        }
    }, WATCH_COOKIE_INTERVAL_DELAY);
    return function () {
        clearInterval(watchCookieIntervalId);
    };
}
//# sourceMappingURL=cookieObservable.js.map