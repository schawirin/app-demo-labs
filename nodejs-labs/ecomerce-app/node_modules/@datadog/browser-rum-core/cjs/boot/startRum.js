"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRum = startRum;
exports.startRumEventCollection = startRumEventCollection;
var browser_core_1 = require("@datadog/browser-core");
var domMutationObservable_1 = require("../browser/domMutationObservable");
var performanceCollection_1 = require("../browser/performanceCollection");
var assembly_1 = require("../domain/assembly");
var internalContext_1 = require("../domain/contexts/internalContext");
var lifeCycle_1 = require("../domain/lifeCycle");
var viewContexts_1 = require("../domain/contexts/viewContexts");
var requestCollection_1 = require("../domain/requestCollection");
var actionCollection_1 = require("../domain/action/actionCollection");
var errorCollection_1 = require("../domain/error/errorCollection");
var longTaskCollection_1 = require("../domain/longTask/longTaskCollection");
var resourceCollection_1 = require("../domain/resource/resourceCollection");
var viewCollection_1 = require("../domain/view/viewCollection");
var rumSessionManager_1 = require("../domain/rumSessionManager");
var startRumBatch_1 = require("../transport/startRumBatch");
var startRumEventBridge_1 = require("../transport/startRumEventBridge");
var urlContexts_1 = require("../domain/contexts/urlContexts");
var locationChangeObservable_1 = require("../browser/locationChangeObservable");
var featureFlagContext_1 = require("../domain/contexts/featureFlagContext");
var startCustomerDataTelemetry_1 = require("../domain/startCustomerDataTelemetry");
var pageStateHistory_1 = require("../domain/contexts/pageStateHistory");
var displayContext_1 = require("../domain/contexts/displayContext");
var vitalCollection_1 = require("../domain/vital/vitalCollection");
var ciVisibilityContext_1 = require("../domain/contexts/ciVisibilityContext");
function startRum(configuration, recorderApi, customerDataTrackerManager, getCommonContext, initialViewOptions, createEncoder, 
// `startRum` and its subcomponents assume tracking consent is granted initially and starts
// collecting logs unconditionally. As such, `startRum` should be called with a
// `trackingConsentState` set to "granted".
trackingConsentState) {
    var cleanupTasks = [];
    var lifeCycle = new lifeCycle_1.LifeCycle();
    lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, function (event) { return (0, browser_core_1.sendToExtension)('rum', event); });
    var telemetry = startRumTelemetry(configuration);
    telemetry.setContextProvider(function () {
        var _a, _b;
        return ({
            application: {
                id: configuration.applicationId,
            },
            session: {
                id: (_a = session.findTrackedSession()) === null || _a === void 0 ? void 0 : _a.id,
            },
            view: {
                id: (_b = viewContexts.findView()) === null || _b === void 0 ? void 0 : _b.id,
            },
            action: {
                id: actionContexts.findActionId(),
            },
        });
    });
    var reportError = function (error) {
        lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error: error });
        (0, browser_core_1.addTelemetryDebug)('Error reported to customer', { 'error.message': error.message });
    };
    var featureFlagContexts = (0, featureFlagContext_1.startFeatureFlagContexts)(lifeCycle, customerDataTrackerManager.getOrCreateTracker(0 /* CustomerDataType.FeatureFlag */));
    var pageExitObservable = (0, browser_core_1.createPageExitObservable)(configuration);
    var pageExitSubscription = pageExitObservable.subscribe(function (event) {
        lifeCycle.notify(11 /* LifeCycleEventType.PAGE_EXITED */, event);
    });
    cleanupTasks.push(function () { return pageExitSubscription.unsubscribe(); });
    var session = !(0, browser_core_1.canUseEventBridge)()
        ? (0, rumSessionManager_1.startRumSessionManager)(configuration, lifeCycle, trackingConsentState)
        : (0, rumSessionManager_1.startRumSessionManagerStub)();
    if (!(0, browser_core_1.canUseEventBridge)()) {
        var batch_1 = (0, startRumBatch_1.startRumBatch)(configuration, lifeCycle, telemetry.observable, reportError, pageExitObservable, session.expireObservable, createEncoder);
        cleanupTasks.push(function () { return batch_1.stop(); });
        (0, startCustomerDataTelemetry_1.startCustomerDataTelemetry)(configuration, telemetry, lifeCycle, customerDataTrackerManager, batch_1.flushObservable);
    }
    else {
        (0, startRumEventBridge_1.startRumEventBridge)(lifeCycle);
    }
    var domMutationObservable = (0, domMutationObservable_1.createDOMMutationObservable)();
    var locationChangeObservable = (0, locationChangeObservable_1.createLocationChangeObservable)(configuration, location);
    var _a = startRumEventCollection(lifeCycle, configuration, location, session, locationChangeObservable, domMutationObservable, getCommonContext, reportError), viewContexts = _a.viewContexts, pageStateHistory = _a.pageStateHistory, urlContexts = _a.urlContexts, actionContexts = _a.actionContexts, addAction = _a.addAction, stopRumEventCollection = _a.stop;
    cleanupTasks.push(stopRumEventCollection);
    (0, browser_core_1.drainPreStartTelemetry)();
    (0, longTaskCollection_1.startLongTaskCollection)(lifeCycle, configuration);
    (0, resourceCollection_1.startResourceCollection)(lifeCycle, configuration, pageStateHistory);
    var _b = (0, viewCollection_1.startViewCollection)(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, featureFlagContexts, pageStateHistory, recorderApi, initialViewOptions), addTiming = _b.addTiming, startView = _b.startView, stopViewCollection = _b.stop;
    cleanupTasks.push(stopViewCollection);
    var addError = (0, errorCollection_1.startErrorCollection)(lifeCycle, configuration, pageStateHistory, featureFlagContexts).addError;
    (0, requestCollection_1.startRequestCollection)(lifeCycle, configuration, session);
    var stopPerformanceCollection = (0, performanceCollection_1.startPerformanceCollection)(lifeCycle, configuration).stop;
    cleanupTasks.push(stopPerformanceCollection);
    var vitalCollection = (0, vitalCollection_1.startVitalCollection)(lifeCycle, pageStateHistory);
    var internalContext = (0, internalContext_1.startInternalContext)(configuration.applicationId, session, viewContexts, actionContexts, urlContexts);
    return {
        addAction: addAction,
        addError: addError,
        addTiming: addTiming,
        addFeatureFlagEvaluation: featureFlagContexts.addFeatureFlagEvaluation,
        startView: startView,
        lifeCycle: lifeCycle,
        viewContexts: viewContexts,
        session: session,
        stopSession: function () { return session.expire(); },
        getInternalContext: internalContext.get,
        startDurationVital: vitalCollection.startDurationVital,
        stopDurationVital: vitalCollection.stopDurationVital,
        stop: function () {
            cleanupTasks.forEach(function (task) { return task(); });
        },
    };
}
function startRumTelemetry(configuration) {
    var telemetry = (0, browser_core_1.startTelemetry)("browser-rum-sdk" /* TelemetryService.RUM */, configuration);
    if ((0, browser_core_1.canUseEventBridge)()) {
        var bridge_1 = (0, browser_core_1.getEventBridge)();
        telemetry.observable.subscribe(function (event) { return bridge_1.send('internal_telemetry', event); });
    }
    return telemetry;
}
function startRumEventCollection(lifeCycle, configuration, location, sessionManager, locationChangeObservable, domMutationObservable, getCommonContext, reportError) {
    var viewContexts = (0, viewContexts_1.startViewContexts)(lifeCycle);
    var urlContexts = (0, urlContexts_1.startUrlContexts)(lifeCycle, locationChangeObservable, location);
    var pageStateHistory = (0, pageStateHistory_1.startPageStateHistory)(configuration);
    var _a = (0, actionCollection_1.startActionCollection)(lifeCycle, domMutationObservable, configuration, pageStateHistory), addAction = _a.addAction, actionContexts = _a.actionContexts;
    var displayContext = (0, displayContext_1.startDisplayContext)(configuration);
    var ciVisibilityContext = (0, ciVisibilityContext_1.startCiVisibilityContext)(configuration);
    (0, assembly_1.startRumAssembly)(configuration, lifeCycle, sessionManager, viewContexts, urlContexts, actionContexts, displayContext, ciVisibilityContext, getCommonContext, reportError);
    return {
        viewContexts: viewContexts,
        pageStateHistory: pageStateHistory,
        urlContexts: urlContexts,
        addAction: addAction,
        actionContexts: actionContexts,
        stop: function () {
            ciVisibilityContext.stop();
            displayContext.stop();
            pageStateHistory.stop();
            urlContexts.stop();
            viewContexts.stop();
            pageStateHistory.stop();
        },
    };
}
//# sourceMappingURL=startRum.js.map