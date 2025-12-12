"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRequestCollection = startRequestCollection;
exports.trackXhr = trackXhr;
exports.trackFetch = trackFetch;
var browser_core_1 = require("@datadog/browser-core");
var resourceUtils_1 = require("./resource/resourceUtils");
var tracer_1 = require("./tracing/tracer");
var nextRequestIndex = 1;
function startRequestCollection(lifeCycle, configuration, sessionManager) {
    var tracer = (0, tracer_1.startTracer)(configuration, sessionManager);
    trackXhr(lifeCycle, configuration, tracer);
    trackFetch(lifeCycle, configuration, tracer);
}
function trackXhr(lifeCycle, configuration, tracer) {
    var subscription = (0, browser_core_1.initXhrObservable)(configuration).subscribe(function (rawContext) {
        var context = rawContext;
        if (!(0, resourceUtils_1.isAllowedRequestUrl)(configuration, context.url)) {
            return;
        }
        switch (context.state) {
            case 'start':
                tracer.traceXhr(context, context.xhr);
                context.requestIndex = getNextRequestIndex();
                lifeCycle.notify(7 /* LifeCycleEventType.REQUEST_STARTED */, {
                    requestIndex: context.requestIndex,
                    url: context.url,
                });
                break;
            case 'complete':
                tracer.clearTracingIfNeeded(context);
                lifeCycle.notify(8 /* LifeCycleEventType.REQUEST_COMPLETED */, {
                    duration: context.duration,
                    method: context.method,
                    requestIndex: context.requestIndex,
                    spanId: context.spanId,
                    startClocks: context.startClocks,
                    status: context.status,
                    traceId: context.traceId,
                    traceSampled: context.traceSampled,
                    type: "xhr" /* RequestType.XHR */,
                    url: context.url,
                    xhr: context.xhr,
                    isAborted: context.isAborted,
                    handlingStack: context.handlingStack,
                });
                break;
        }
    });
    return { stop: function () { return subscription.unsubscribe(); } };
}
function trackFetch(lifeCycle, configuration, tracer) {
    var subscription = (0, browser_core_1.initFetchObservable)().subscribe(function (rawContext) {
        var context = rawContext;
        if (!(0, resourceUtils_1.isAllowedRequestUrl)(configuration, context.url)) {
            return;
        }
        switch (context.state) {
            case 'start':
                tracer.traceFetch(context);
                context.requestIndex = getNextRequestIndex();
                lifeCycle.notify(7 /* LifeCycleEventType.REQUEST_STARTED */, {
                    requestIndex: context.requestIndex,
                    url: context.url,
                });
                break;
            case 'resolve':
                waitForResponseToComplete(context, function (duration) {
                    tracer.clearTracingIfNeeded(context);
                    lifeCycle.notify(8 /* LifeCycleEventType.REQUEST_COMPLETED */, {
                        duration: duration,
                        method: context.method,
                        requestIndex: context.requestIndex,
                        responseType: context.responseType,
                        spanId: context.spanId,
                        startClocks: context.startClocks,
                        status: context.status,
                        traceId: context.traceId,
                        traceSampled: context.traceSampled,
                        type: "fetch" /* RequestType.FETCH */,
                        url: context.url,
                        response: context.response,
                        init: context.init,
                        input: context.input,
                        isAborted: context.isAborted,
                        handlingStack: context.handlingStack,
                    });
                });
                break;
        }
    });
    return { stop: function () { return subscription.unsubscribe(); } };
}
function getNextRequestIndex() {
    var result = nextRequestIndex;
    nextRequestIndex += 1;
    return result;
}
function waitForResponseToComplete(context, callback) {
    var clonedResponse = context.response && (0, browser_core_1.tryToClone)(context.response);
    if (!clonedResponse || !clonedResponse.body) {
        // do not try to wait for the response if the clone failed, fetch error or null body
        callback((0, browser_core_1.elapsed)(context.startClocks.timeStamp, (0, browser_core_1.timeStampNow)()));
    }
    else {
        (0, browser_core_1.readBytesFromStream)(clonedResponse.body, function () {
            callback((0, browser_core_1.elapsed)(context.startClocks.timeStamp, (0, browser_core_1.timeStampNow)()));
        }, {
            bytesLimit: Number.POSITIVE_INFINITY,
            collectStreamBody: false,
        });
    }
}
//# sourceMappingURL=requestCollection.js.map