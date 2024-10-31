import { elapsed, noop, ONE_MINUTE } from '@datadog/browser-core';
import { RumPerformanceEntryType, supportPerformanceTimingEvent } from '../../../browser/performanceCollection';
import { getSelectorFromElement } from '../../getSelectorFromElement';
import { isElementNode } from '../../../browser/htmlDomUtils';
import { getInteractionCount, initInteractionCountPolyfill } from './interactionCountPolyfill';
// Arbitrary value to prevent unnecessary memory usage on views with lots of interactions.
var MAX_INTERACTION_ENTRIES = 10;
// Arbitrary value to cap INP outliers
export var MAX_INP_VALUE = (1 * ONE_MINUTE);
/**
 * Track the interaction to next paint (INP).
 * To avoid outliers, return the p98 worst interaction of the view.
 * Documentation: https://web.dev/inp/
 * Reference implementation: https://github.com/GoogleChrome/web-vitals/blob/main/src/onINP.ts
 */
export function trackInteractionToNextPaint(configuration, viewStart, viewLoadingType, lifeCycle) {
    if (!isInteractionToNextPaintSupported()) {
        return {
            getInteractionToNextPaint: function () { return undefined; },
            setViewEnd: noop,
            stop: noop,
        };
    }
    var _a = trackViewInteractionCount(viewLoadingType), getViewInteractionCount = _a.getViewInteractionCount, stopViewInteractionCount = _a.stopViewInteractionCount;
    var viewEnd = Infinity;
    var longestInteractions = trackLongestInteractions(getViewInteractionCount);
    var interactionToNextPaint = -1;
    var interactionToNextPaintTargetSelector;
    var interactionToNextPaintStartTime;
    var stop = lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if ((entry.entryType === RumPerformanceEntryType.EVENT ||
                entry.entryType === RumPerformanceEntryType.FIRST_INPUT) &&
                entry.interactionId &&
                // Check the entry start time is inside the view bounds because some view interactions can be reported after the view end (if long duration).
                entry.startTime >= viewStart &&
                entry.startTime <= viewEnd) {
                longestInteractions.process(entry);
            }
        }
        var newInteraction = longestInteractions.estimateP98Interaction();
        if (newInteraction && newInteraction.duration !== interactionToNextPaint) {
            interactionToNextPaint = newInteraction.duration;
            interactionToNextPaintStartTime = elapsed(viewStart, newInteraction.startTime);
            if (newInteraction.target && isElementNode(newInteraction.target)) {
                interactionToNextPaintTargetSelector = getSelectorFromElement(newInteraction.target, configuration.actionNameAttribute);
            }
            else {
                interactionToNextPaintTargetSelector = undefined;
            }
        }
    }).unsubscribe;
    return {
        getInteractionToNextPaint: function () {
            // If no INP duration where captured because of the performanceObserver 40ms threshold
            // but the view interaction count > 0 then report 0
            if (interactionToNextPaint >= 0) {
                return {
                    value: Math.min(interactionToNextPaint, MAX_INP_VALUE),
                    targetSelector: interactionToNextPaintTargetSelector,
                    time: interactionToNextPaintStartTime,
                };
            }
            else if (getViewInteractionCount()) {
                return {
                    value: 0,
                };
            }
        },
        setViewEnd: function (viewEndTime) {
            viewEnd = viewEndTime;
            stopViewInteractionCount();
        },
        stop: stop,
    };
}
function trackLongestInteractions(getViewInteractionCount) {
    var longestInteractions = [];
    function sortAndTrimLongestInteractions() {
        longestInteractions.sort(function (a, b) { return b.duration - a.duration; }).splice(MAX_INTERACTION_ENTRIES);
    }
    return {
        /**
         * Process the performance entry:
         * - if its duration is long enough, add the performance entry to the list of worst interactions
         * - if an entry with the same interaction id exists and its duration is lower than the new one, then replace it in the list of worst interactions
         */
        process: function (entry) {
            var interactionIndex = longestInteractions.findIndex(function (interaction) { return entry.interactionId === interaction.interactionId; });
            var minLongestInteraction = longestInteractions[longestInteractions.length - 1];
            if (interactionIndex !== -1) {
                if (entry.duration > longestInteractions[interactionIndex].duration) {
                    longestInteractions[interactionIndex] = entry;
                    sortAndTrimLongestInteractions();
                }
            }
            else if (longestInteractions.length < MAX_INTERACTION_ENTRIES ||
                entry.duration > minLongestInteraction.duration) {
                longestInteractions.push(entry);
                sortAndTrimLongestInteractions();
            }
        },
        /**
         * Compute the p98 longest interaction.
         * For better performance the computation is based on 10 longest interactions and the interaction count of the current view.
         */
        estimateP98Interaction: function () {
            var interactionIndex = Math.min(longestInteractions.length - 1, Math.floor(getViewInteractionCount() / 50));
            return longestInteractions[interactionIndex];
        },
    };
}
export function trackViewInteractionCount(viewLoadingType) {
    initInteractionCountPolyfill();
    var previousInteractionCount = viewLoadingType === "initial_load" /* ViewLoadingType.INITIAL_LOAD */ ? 0 : getInteractionCount();
    var state = { stopped: false };
    function computeViewInteractionCount() {
        return getInteractionCount() - previousInteractionCount;
    }
    return {
        getViewInteractionCount: function () {
            if (state.stopped) {
                return state.interactionCount;
            }
            return computeViewInteractionCount();
        },
        stopViewInteractionCount: function () {
            state = { stopped: true, interactionCount: computeViewInteractionCount() };
        },
    };
}
export function isInteractionToNextPaintSupported() {
    return (supportPerformanceTimingEvent(RumPerformanceEntryType.EVENT) &&
        window.PerformanceEventTiming &&
        'interactionId' in PerformanceEventTiming.prototype);
}
//# sourceMappingURL=trackInteractionToNextPaint.js.map