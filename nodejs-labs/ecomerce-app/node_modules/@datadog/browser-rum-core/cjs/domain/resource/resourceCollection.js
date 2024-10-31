"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startResourceCollection = startResourceCollection;
var browser_core_1 = require("@datadog/browser-core");
var performanceCollection_1 = require("../../browser/performanceCollection");
var matchRequestTiming_1 = require("./matchRequestTiming");
var resourceUtils_1 = require("./resourceUtils");
function startResourceCollection(lifeCycle, configuration, pageStateHistory) {
    lifeCycle.subscribe(8 /* LifeCycleEventType.REQUEST_COMPLETED */, function (request) {
        var rawEvent = processRequest(request, configuration, pageStateHistory);
        if (rawEvent) {
            lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, rawEvent);
        }
    });
    lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType === performanceCollection_1.RumPerformanceEntryType.RESOURCE && !(0, resourceUtils_1.isRequestKind)(entry)) {
                var rawEvent = processResourceEntry(entry, configuration);
                if (rawEvent) {
                    lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, rawEvent);
                }
            }
        }
    });
}
function processRequest(request, configuration, pageStateHistory) {
    var matchingTiming = (0, matchRequestTiming_1.matchRequestTiming)(request);
    var startClocks = matchingTiming ? (0, browser_core_1.relativeToClocks)(matchingTiming.startTime) : request.startClocks;
    var tracingInfo = computeRequestTracingInfo(request, configuration);
    if (!configuration.trackResources && !tracingInfo) {
        return;
    }
    var type = request.type === "xhr" /* RequestType.XHR */ ? "xhr" /* ResourceType.XHR */ : "fetch" /* ResourceType.FETCH */;
    var correspondingTimingOverrides = matchingTiming ? computePerformanceEntryMetrics(matchingTiming) : undefined;
    var duration = computeRequestDuration(pageStateHistory, startClocks, request.duration);
    var resourceEvent = (0, browser_core_1.combine)({
        date: startClocks.timeStamp,
        resource: {
            id: (0, browser_core_1.generateUUID)(),
            type: type,
            duration: duration,
            method: request.method,
            status_code: request.status,
            url: (0, resourceUtils_1.isLongDataUrl)(request.url) ? (0, resourceUtils_1.sanitizeDataUrl)(request.url) : request.url,
        },
        type: "resource" /* RumEventType.RESOURCE */,
        _dd: {
            discarded: !configuration.trackResources,
        },
    }, tracingInfo, correspondingTimingOverrides);
    return {
        startTime: startClocks.relative,
        rawRumEvent: resourceEvent,
        domainContext: {
            performanceEntry: matchingTiming,
            xhr: request.xhr,
            response: request.response,
            requestInput: request.input,
            requestInit: request.init,
            error: request.error,
            isAborted: request.isAborted,
            handlingStack: request.handlingStack,
        },
    };
}
function processResourceEntry(entry, configuration) {
    var startClocks = (0, browser_core_1.relativeToClocks)(entry.startTime);
    var tracingInfo = computeEntryTracingInfo(entry, configuration);
    if (!configuration.trackResources && !tracingInfo) {
        return;
    }
    var type = (0, resourceUtils_1.computeResourceKind)(entry);
    var entryMetrics = computePerformanceEntryMetrics(entry);
    var resourceEvent = (0, browser_core_1.combine)({
        date: startClocks.timeStamp,
        resource: {
            id: (0, browser_core_1.generateUUID)(),
            type: type,
            url: entry.name,
            status_code: discardZeroStatus(entry.responseStatus),
        },
        type: "resource" /* RumEventType.RESOURCE */,
        _dd: {
            discarded: !configuration.trackResources,
        },
    }, tracingInfo, entryMetrics);
    return {
        startTime: startClocks.relative,
        rawRumEvent: resourceEvent,
        domainContext: {
            performanceEntry: entry,
        },
    };
}
function computePerformanceEntryMetrics(timing) {
    var renderBlockingStatus = timing.renderBlockingStatus;
    return {
        resource: (0, browser_core_1.assign)({
            duration: (0, resourceUtils_1.computePerformanceResourceDuration)(timing),
            render_blocking_status: renderBlockingStatus,
        }, (0, resourceUtils_1.computeSize)(timing), (0, resourceUtils_1.computePerformanceResourceDetails)(timing)),
    };
}
function computeRequestTracingInfo(request, configuration) {
    var hasBeenTraced = request.traceSampled && request.traceId && request.spanId;
    if (!hasBeenTraced) {
        return undefined;
    }
    return {
        _dd: {
            span_id: request.spanId.toDecimalString(),
            trace_id: request.traceId.toDecimalString(),
            rule_psr: getRulePsr(configuration),
        },
    };
}
function computeEntryTracingInfo(entry, configuration) {
    var hasBeenTraced = entry.traceId;
    if (!hasBeenTraced) {
        return undefined;
    }
    return {
        _dd: {
            trace_id: entry.traceId,
            rule_psr: getRulePsr(configuration),
        },
    };
}
/**
 * @returns number between 0 and 1 which represents trace sample rate
 */
function getRulePsr(configuration) {
    return (0, browser_core_1.isNumber)(configuration.traceSampleRate) ? configuration.traceSampleRate / 100 : undefined;
}
function computeRequestDuration(pageStateHistory, startClocks, duration) {
    return !pageStateHistory.wasInPageStateDuringPeriod("frozen" /* PageState.FROZEN */, startClocks.relative, duration)
        ? (0, browser_core_1.toServerDuration)(duration)
        : undefined;
}
/**
 * The status is 0 for cross-origin resources without CORS headers, so the status is meaningless, and we shouldn't report it
 * https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/responseStatus#cross-origin_response_status_codes
 */
function discardZeroStatus(statusCode) {
    return statusCode === 0 ? undefined : statusCode;
}
//# sourceMappingURL=resourceCollection.js.map