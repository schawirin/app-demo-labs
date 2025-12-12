"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchRequestTiming = matchRequestTiming;
var browser_core_1 = require("@datadog/browser-core");
var polyfills_1 = require("../../browser/polyfills");
var resourceUtils_1 = require("./resourceUtils");
var alreadyMatchedEntries = new polyfills_1.WeakSet();
/**
 * Look for corresponding timing in resource timing buffer
 *
 * Observations:
 * - Timing (start, end) are nested inside the request (start, end)
 * - Some timing can be not exactly nested, being off by < 1 ms
 *
 * Strategy:
 * - from valid nested entries (with 1 ms error margin)
 * - filter out timing that were already matched to a request
 * - then, if a single timing match, return the timing
 * - otherwise we can't decide, return undefined
 */
function matchRequestTiming(request) {
    if (!performance || !('getEntriesByName' in performance)) {
        return;
    }
    var sameNameEntries = performance.getEntriesByName(request.url, 'resource');
    if (!sameNameEntries.length || !('toJSON' in sameNameEntries[0])) {
        return;
    }
    var candidates = sameNameEntries
        .filter(function (entry) { return !alreadyMatchedEntries.has(entry); })
        .filter(function (entry) { return (0, resourceUtils_1.isValidEntry)(entry); })
        .filter(function (entry) {
        return isBetween(entry, request.startClocks.relative, endTime({ startTime: request.startClocks.relative, duration: request.duration }));
    });
    if (candidates.length === 1) {
        alreadyMatchedEntries.add(candidates[0]);
        return candidates[0].toJSON();
    }
    return;
}
function endTime(timing) {
    return (0, browser_core_1.addDuration)(timing.startTime, timing.duration);
}
function isBetween(timing, start, end) {
    var errorMargin = 1;
    return timing.startTime >= start - errorMargin && endTime(timing) <= (0, browser_core_1.addDuration)(end, errorMargin);
}
//# sourceMappingURL=matchRequestTiming.js.map