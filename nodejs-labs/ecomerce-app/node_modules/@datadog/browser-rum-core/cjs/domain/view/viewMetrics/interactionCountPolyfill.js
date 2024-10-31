"use strict";
/**
 * performance.interactionCount polyfill
 *
 * The interactionCount is an integer which counts the total number of distinct user interactions,
 * for which there was a unique interactionId.
 *
 * The interactionCount polyfill is an estimate based on a convention specific to Chrome. Cf: https://github.com/GoogleChrome/web-vitals/pull/213
 * This is currently not an issue as the polyfill is only used for INP which is currently only supported on Chrome.
 * Hopefully when/if other browsers will support INP, they will also implement performance.interactionCount at the same time, so we won't need that polyfill.
 *
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/main/src/lib/polyfills/interactionCountPolyfill.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInteractionCount = void 0;
exports.initInteractionCountPolyfill = initInteractionCountPolyfill;
var browser_core_1 = require("@datadog/browser-core");
var observer;
var interactionCountEstimate = 0;
var minKnownInteractionId = Infinity;
var maxKnownInteractionId = 0;
function initInteractionCountPolyfill() {
    if ('interactionCount' in performance || observer) {
        return;
    }
    observer = new window.PerformanceObserver((0, browser_core_1.monitor)(function (entries) {
        entries.getEntries().forEach(function (e) {
            var entry = e;
            if (entry.interactionId) {
                minKnownInteractionId = Math.min(minKnownInteractionId, entry.interactionId);
                maxKnownInteractionId = Math.max(maxKnownInteractionId, entry.interactionId);
                interactionCountEstimate = (maxKnownInteractionId - minKnownInteractionId) / 7 + 1;
            }
        });
    }));
    observer.observe({ type: 'event', buffered: true, durationThreshold: 0 });
}
/**
 * Returns the `interactionCount` value using the native API (if available)
 * or the polyfill estimate in this module.
 */
var getInteractionCount = function () {
    return observer ? interactionCountEstimate : window.performance.interactionCount || 0;
};
exports.getInteractionCount = getInteractionCount;
//# sourceMappingURL=interactionCountPolyfill.js.map