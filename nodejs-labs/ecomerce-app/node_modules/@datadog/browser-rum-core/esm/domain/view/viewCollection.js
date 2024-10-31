import { isEmptyObject, mapValues, toServerDuration } from '@datadog/browser-core';
import { discardNegativeDuration } from '../discardNegativeDuration';
import { trackViews } from './trackViews';
export function startViewCollection(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, featureFlagContexts, pageStateHistory, recorderApi, initialViewOptions) {
    lifeCycle.subscribe(4 /* LifeCycleEventType.VIEW_UPDATED */, function (view) {
        return lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processViewUpdate(view, configuration, featureFlagContexts, recorderApi, pageStateHistory));
    });
    return trackViews(location, lifeCycle, domMutationObservable, configuration, locationChangeObservable, !configuration.trackViewsManually, initialViewOptions);
}
function processViewUpdate(view, configuration, featureFlagContexts, recorderApi, pageStateHistory) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var replayStats = recorderApi.getReplayStats(view.id);
    var featureFlagContext = featureFlagContexts.findFeatureFlagEvaluations(view.startClocks.relative);
    var pageStates = pageStateHistory.findAll(view.startClocks.relative, view.duration);
    var viewEvent = {
        _dd: {
            document_version: view.documentVersion,
            replay_stats: replayStats,
            page_states: pageStates,
            configuration: {
                start_session_replay_recording_manually: configuration.startSessionReplayRecordingManually,
            },
        },
        date: view.startClocks.timeStamp,
        type: "view" /* RumEventType.VIEW */,
        view: {
            action: {
                count: view.eventCounts.actionCount,
            },
            frustration: {
                count: view.eventCounts.frustrationCount,
            },
            cumulative_layout_shift: (_a = view.commonViewMetrics.cumulativeLayoutShift) === null || _a === void 0 ? void 0 : _a.value,
            cumulative_layout_shift_time: toServerDuration((_b = view.commonViewMetrics.cumulativeLayoutShift) === null || _b === void 0 ? void 0 : _b.time),
            cumulative_layout_shift_target_selector: (_c = view.commonViewMetrics.cumulativeLayoutShift) === null || _c === void 0 ? void 0 : _c.targetSelector,
            first_byte: toServerDuration((_d = view.initialViewMetrics.navigationTimings) === null || _d === void 0 ? void 0 : _d.firstByte),
            dom_complete: toServerDuration((_e = view.initialViewMetrics.navigationTimings) === null || _e === void 0 ? void 0 : _e.domComplete),
            dom_content_loaded: toServerDuration((_f = view.initialViewMetrics.navigationTimings) === null || _f === void 0 ? void 0 : _f.domContentLoaded),
            dom_interactive: toServerDuration((_g = view.initialViewMetrics.navigationTimings) === null || _g === void 0 ? void 0 : _g.domInteractive),
            error: {
                count: view.eventCounts.errorCount,
            },
            first_contentful_paint: toServerDuration(view.initialViewMetrics.firstContentfulPaint),
            first_input_delay: toServerDuration((_h = view.initialViewMetrics.firstInput) === null || _h === void 0 ? void 0 : _h.delay),
            first_input_time: toServerDuration((_j = view.initialViewMetrics.firstInput) === null || _j === void 0 ? void 0 : _j.time),
            first_input_target_selector: (_k = view.initialViewMetrics.firstInput) === null || _k === void 0 ? void 0 : _k.targetSelector,
            interaction_to_next_paint: toServerDuration((_l = view.commonViewMetrics.interactionToNextPaint) === null || _l === void 0 ? void 0 : _l.value),
            interaction_to_next_paint_time: toServerDuration((_m = view.commonViewMetrics.interactionToNextPaint) === null || _m === void 0 ? void 0 : _m.time),
            interaction_to_next_paint_target_selector: (_o = view.commonViewMetrics.interactionToNextPaint) === null || _o === void 0 ? void 0 : _o.targetSelector,
            is_active: view.isActive,
            name: view.name,
            largest_contentful_paint: toServerDuration((_p = view.initialViewMetrics.largestContentfulPaint) === null || _p === void 0 ? void 0 : _p.value),
            largest_contentful_paint_target_selector: (_q = view.initialViewMetrics.largestContentfulPaint) === null || _q === void 0 ? void 0 : _q.targetSelector,
            load_event: toServerDuration((_r = view.initialViewMetrics.navigationTimings) === null || _r === void 0 ? void 0 : _r.loadEvent),
            loading_time: discardNegativeDuration(toServerDuration(view.commonViewMetrics.loadingTime)),
            loading_type: view.loadingType,
            long_task: {
                count: view.eventCounts.longTaskCount,
            },
            resource: {
                count: view.eventCounts.resourceCount,
            },
            time_spent: toServerDuration(view.duration),
        },
        feature_flags: featureFlagContext && !isEmptyObject(featureFlagContext) ? featureFlagContext : undefined,
        display: view.commonViewMetrics.scroll
            ? {
                scroll: {
                    max_depth: view.commonViewMetrics.scroll.maxDepth,
                    max_depth_scroll_top: view.commonViewMetrics.scroll.maxDepthScrollTop,
                    max_scroll_height: view.commonViewMetrics.scroll.maxScrollHeight,
                    max_scroll_height_time: toServerDuration(view.commonViewMetrics.scroll.maxScrollHeightTime),
                },
            }
            : undefined,
        session: {
            has_replay: replayStats ? true : undefined,
            is_active: view.sessionIsActive ? undefined : false,
        },
        privacy: {
            replay_level: configuration.defaultPrivacyLevel,
        },
    };
    if (!isEmptyObject(view.customTimings)) {
        viewEvent.view.custom_timings = mapValues(view.customTimings, toServerDuration);
    }
    return {
        rawRumEvent: viewEvent,
        startTime: view.startClocks.relative,
        domainContext: {
            location: view.location,
        },
    };
}
//# sourceMappingURL=viewCollection.js.map