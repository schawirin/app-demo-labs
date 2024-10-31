import { isEmptyObject, assign, ErrorSource, generateUUID, computeRawError, computeStackTrace, Observable, trackRuntimeError, } from '@datadog/browser-core';
import { trackConsoleError } from './trackConsoleError';
import { trackReportError } from './trackReportError';
export function startErrorCollection(lifeCycle, configuration, pageStateHistory, featureFlagContexts) {
    var errorObservable = new Observable();
    trackConsoleError(errorObservable);
    trackRuntimeError(errorObservable);
    trackReportError(configuration, errorObservable);
    errorObservable.subscribe(function (error) { return lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error: error }); });
    return doStartErrorCollection(lifeCycle, pageStateHistory, featureFlagContexts);
}
export function doStartErrorCollection(lifeCycle, pageStateHistory, featureFlagContexts) {
    lifeCycle.subscribe(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, function (_a) {
        var error = _a.error, customerContext = _a.customerContext, savedCommonContext = _a.savedCommonContext;
        lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, assign({
            customerContext: customerContext,
            savedCommonContext: savedCommonContext,
        }, processError(error, pageStateHistory, featureFlagContexts)));
    });
    return {
        addError: function (_a, savedCommonContext) {
            var error = _a.error, handlingStack = _a.handlingStack, startClocks = _a.startClocks, customerContext = _a.context;
            var stackTrace = error instanceof Error ? computeStackTrace(error) : undefined;
            var rawError = computeRawError({
                stackTrace: stackTrace,
                originalError: error,
                handlingStack: handlingStack,
                startClocks: startClocks,
                nonErrorPrefix: "Provided" /* NonErrorPrefix.PROVIDED */,
                source: ErrorSource.CUSTOM,
                handling: "handled" /* ErrorHandling.HANDLED */,
            });
            lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, {
                customerContext: customerContext,
                savedCommonContext: savedCommonContext,
                error: rawError,
            });
        },
    };
}
function processError(error, pageStateHistory, featureFlagContexts) {
    var rawRumEvent = {
        date: error.startClocks.timeStamp,
        error: {
            id: generateUUID(),
            message: error.message,
            source: error.source,
            stack: error.stack,
            handling_stack: error.handlingStack,
            type: error.type,
            handling: error.handling,
            causes: error.causes,
            source_type: 'browser',
            fingerprint: error.fingerprint,
            csp: error.csp,
        },
        type: "error" /* RumEventType.ERROR */,
        view: { in_foreground: pageStateHistory.wasInPageStateAt("active" /* PageState.ACTIVE */, error.startClocks.relative) },
    };
    var featureFlagContext = featureFlagContexts.findFeatureFlagEvaluations(error.startClocks.relative);
    if (featureFlagContext && !isEmptyObject(featureFlagContext)) {
        rawRumEvent.feature_flags = featureFlagContext;
    }
    var domainContext = {
        error: error.originalError,
        handlingStack: error.handlingStack,
    };
    return {
        rawRumEvent: rawRumEvent,
        startTime: error.startClocks.relative,
        domainContext: domainContext,
    };
}
//# sourceMappingURL=errorCollection.js.map