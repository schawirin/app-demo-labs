"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUTATION_PROCESS_MIN_DELAY = void 0;
exports.createMutationBatch = createMutationBatch;
var browser_core_1 = require("@datadog/browser-core");
/**
 * Maximum duration to wait before processing mutations. If the browser is idle, mutations will be
 * processed more quickly. If the browser is busy executing small tasks (ex: rendering frames), the
 * mutations will wait MUTATION_PROCESS_MAX_DELAY milliseconds before being processed. If the
 * browser is busy executing a longer task, mutations will be processed after this task.
 */
var MUTATION_PROCESS_MAX_DELAY = 100;
/**
 * Minimum duration to wait before processing mutations. This is used to batch mutations together
 * and be able to deduplicate them to save processing time and bandwidth.
 * 16ms is the duration of a frame at 60fps that ensure fluid UI.
 */
exports.MUTATION_PROCESS_MIN_DELAY = 16;
function createMutationBatch(processMutationBatch) {
    var cancelScheduledFlush = browser_core_1.noop;
    var pendingMutations = [];
    function flush() {
        cancelScheduledFlush();
        processMutationBatch(pendingMutations);
        pendingMutations = [];
    }
    var _a = (0, browser_core_1.throttle)(flush, exports.MUTATION_PROCESS_MIN_DELAY, {
        leading: false,
    }), throttledFlush = _a.throttled, cancelThrottle = _a.cancel;
    return {
        addMutations: function (mutations) {
            if (pendingMutations.length === 0) {
                cancelScheduledFlush = requestIdleCallback(throttledFlush, { timeout: MUTATION_PROCESS_MAX_DELAY });
            }
            pendingMutations.push.apply(pendingMutations, mutations);
        },
        flush: flush,
        stop: function () {
            cancelScheduledFlush();
            cancelThrottle();
        },
    };
}
/**
 * Use 'requestIdleCallback' when available: it will throttle the mutation processing if the
 * browser is busy rendering frames (ex: when frames are below 60fps). When not available, the
 * fallback on 'requestAnimationFrame' will still ensure the mutations are processed after any
 * browser rendering process (Layout, Recalculate Style, etc.), so we can serialize DOM nodes efficiently.
 *
 * Note: check both 'requestIdleCallback' and 'cancelIdleCallback' existence because some polyfills only implement 'requestIdleCallback'.
 */
function requestIdleCallback(callback, opts) {
    if (window.requestIdleCallback && window.cancelIdleCallback) {
        var id_1 = window.requestIdleCallback((0, browser_core_1.monitor)(callback), opts);
        return function () { return window.cancelIdleCallback(id_1); };
    }
    var id = window.requestAnimationFrame((0, browser_core_1.monitor)(callback));
    return function () { return window.cancelAnimationFrame(id); };
}
//# sourceMappingURL=mutationBatch.js.map