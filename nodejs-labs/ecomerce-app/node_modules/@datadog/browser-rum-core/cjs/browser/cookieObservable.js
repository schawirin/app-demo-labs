"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WATCH_COOKIE_INTERVAL_DELAY = void 0;
exports.createCookieObservable = createCookieObservable;
var browser_core_1 = require("@datadog/browser-core");
function createCookieObservable(configuration, cookieName) {
    var detectCookieChangeStrategy = window.cookieStore
        ? listenToCookieStoreChange(configuration)
        : watchCookieFallback;
    return new browser_core_1.Observable(function (observable) {
        return detectCookieChangeStrategy(cookieName, function (event) { return observable.notify(event); });
    });
}
function listenToCookieStoreChange(configuration) {
    return function (cookieName, callback) {
        var listener = (0, browser_core_1.addEventListener)(configuration, window.cookieStore, browser_core_1.DOM_EVENT.CHANGE, function (event) {
            // Based on our experimentation, we're assuming that entries for the same cookie cannot be in both the 'changed' and 'deleted' arrays.
            // However, due to ambiguity in the specification, we asked for clarification: https://github.com/WICG/cookie-store/issues/226
            var changeEvent = (0, browser_core_1.find)(event.changed, function (event) { return event.name === cookieName; }) ||
                (0, browser_core_1.find)(event.deleted, function (event) { return event.name === cookieName; });
            if (changeEvent) {
                callback(changeEvent.value);
            }
        });
        return listener.stop;
    };
}
exports.WATCH_COOKIE_INTERVAL_DELAY = browser_core_1.ONE_SECOND;
function watchCookieFallback(cookieName, callback) {
    var previousCookieValue = (0, browser_core_1.findCommaSeparatedValue)(document.cookie, cookieName);
    var watchCookieIntervalId = (0, browser_core_1.setInterval)(function () {
        var cookieValue = (0, browser_core_1.findCommaSeparatedValue)(document.cookie, cookieName);
        if (cookieValue !== previousCookieValue) {
            callback(cookieValue);
        }
    }, exports.WATCH_COOKIE_INTERVAL_DELAY);
    return function () {
        (0, browser_core_1.clearInterval)(watchCookieIntervalId);
    };
}
//# sourceMappingURL=cookieObservable.js.map