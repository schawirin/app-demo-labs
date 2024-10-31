"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRumPublicApi = makeRumPublicApi;
var browser_core_1 = require("@datadog/browser-core");
var commonContext_1 = require("../domain/contexts/commonContext");
var preStartRum_1 = require("./preStartRum");
var RUM_STORAGE_KEY = 'rum';
function makeRumPublicApi(startRumImpl, recorderApi, options) {
    if (options === void 0) { options = {}; }
    var customerDataTrackerManager = (0, browser_core_1.createCustomerDataTrackerManager)(0 /* CustomerDataCompressionStatus.Unknown */);
    var globalContextManager = (0, browser_core_1.createContextManager)(customerDataTrackerManager.getOrCreateTracker(2 /* CustomerDataType.GlobalContext */));
    var userContextManager = (0, browser_core_1.createContextManager)(customerDataTrackerManager.getOrCreateTracker(1 /* CustomerDataType.User */));
    var trackingConsentState = (0, browser_core_1.createTrackingConsentState)();
    function getCommonContext() {
        return (0, commonContext_1.buildCommonContext)(globalContextManager, userContextManager, recorderApi);
    }
    var strategy = (0, preStartRum_1.createPreStartStrategy)(options, getCommonContext, trackingConsentState, function (configuration, deflateWorker, initialViewOptions) {
        if ((0, browser_core_1.isExperimentalFeatureEnabled)(browser_core_1.ExperimentalFeature.CUSTOM_VITALS)) {
            /**
             * Start a custom duration vital
             * stored in @vital.custom.<name>
             *
             * @param name name of the custom vital
             * @param options.context custom context attached to the vital
             * @param options.startTime epoch timestamp of the start of the custom vital (if not set, will use current time)
             */
            ;
            rumPublicApi.startDurationVital = (0, browser_core_1.monitor)(function (name, options) {
                strategy.startDurationVital({
                    name: (0, browser_core_1.sanitize)(name),
                    startClocks: (options === null || options === void 0 ? void 0 : options.startTime) ? (0, browser_core_1.timeStampToClocks)(options.startTime) : (0, browser_core_1.clocksNow)(),
                    context: (0, browser_core_1.sanitize)(options === null || options === void 0 ? void 0 : options.context),
                });
                (0, browser_core_1.addTelemetryUsage)({ feature: 'start-duration-vital' });
            });
            rumPublicApi.stopDurationVital = (0, browser_core_1.monitor)(function (name, options) {
                strategy.stopDurationVital({
                    name: (0, browser_core_1.sanitize)(name),
                    stopClocks: (options === null || options === void 0 ? void 0 : options.stopTime) ? (0, browser_core_1.timeStampToClocks)(options.stopTime) : (0, browser_core_1.clocksNow)(),
                    context: (0, browser_core_1.sanitize)(options === null || options === void 0 ? void 0 : options.context),
                });
            });
        }
        if (configuration.storeContextsAcrossPages) {
            (0, browser_core_1.storeContextManager)(configuration, globalContextManager, RUM_STORAGE_KEY, 2 /* CustomerDataType.GlobalContext */);
            (0, browser_core_1.storeContextManager)(configuration, userContextManager, RUM_STORAGE_KEY, 1 /* CustomerDataType.User */);
        }
        customerDataTrackerManager.setCompressionStatus(deflateWorker ? 1 /* CustomerDataCompressionStatus.Enabled */ : 2 /* CustomerDataCompressionStatus.Disabled */);
        var startRumResult = startRumImpl(configuration, recorderApi, customerDataTrackerManager, getCommonContext, initialViewOptions, deflateWorker && options.createDeflateEncoder
            ? function (streamId) { return options.createDeflateEncoder(configuration, deflateWorker, streamId); }
            : browser_core_1.createIdentityEncoder, trackingConsentState);
        recorderApi.onRumStart(startRumResult.lifeCycle, configuration, startRumResult.session, startRumResult.viewContexts, deflateWorker);
        strategy = createPostStartStrategy(strategy, startRumResult);
        return startRumResult;
    });
    var startView = (0, browser_core_1.monitor)(function (options) {
        var sanitizedOptions = typeof options === 'object' ? options : { name: options };
        strategy.startView(sanitizedOptions);
        (0, browser_core_1.addTelemetryUsage)({ feature: 'start-view' });
    });
    var rumPublicApi = (0, browser_core_1.makePublicApi)({
        init: (0, browser_core_1.monitor)(function (initConfiguration) { return strategy.init(initConfiguration, rumPublicApi); }),
        setTrackingConsent: (0, browser_core_1.monitor)(function (trackingConsent) {
            trackingConsentState.update(trackingConsent);
            (0, browser_core_1.addTelemetryUsage)({ feature: 'set-tracking-consent', tracking_consent: trackingConsent });
        }),
        setGlobalContext: (0, browser_core_1.monitor)(function (context) {
            globalContextManager.setContext(context);
            (0, browser_core_1.addTelemetryUsage)({ feature: 'set-global-context' });
        }),
        getGlobalContext: (0, browser_core_1.monitor)(function () { return globalContextManager.getContext(); }),
        setGlobalContextProperty: (0, browser_core_1.monitor)(function (key, value) {
            globalContextManager.setContextProperty(key, value);
            (0, browser_core_1.addTelemetryUsage)({ feature: 'set-global-context' });
        }),
        removeGlobalContextProperty: (0, browser_core_1.monitor)(function (key) { return globalContextManager.removeContextProperty(key); }),
        clearGlobalContext: (0, browser_core_1.monitor)(function () { return globalContextManager.clearContext(); }),
        getInternalContext: (0, browser_core_1.monitor)(function (startTime) { return strategy.getInternalContext(startTime); }),
        getInitConfiguration: (0, browser_core_1.monitor)(function () { return (0, browser_core_1.deepClone)(strategy.initConfiguration); }),
        addAction: function (name, context) {
            var handlingStack = (0, browser_core_1.createHandlingStack)();
            (0, browser_core_1.callMonitored)(function () {
                strategy.addAction({
                    name: (0, browser_core_1.sanitize)(name),
                    context: (0, browser_core_1.sanitize)(context),
                    startClocks: (0, browser_core_1.clocksNow)(),
                    type: "custom" /* ActionType.CUSTOM */,
                    handlingStack: handlingStack,
                });
                (0, browser_core_1.addTelemetryUsage)({ feature: 'add-action' });
            });
        },
        addError: function (error, context) {
            var handlingStack = (0, browser_core_1.createHandlingStack)();
            (0, browser_core_1.callMonitored)(function () {
                strategy.addError({
                    error: error, // Do not sanitize error here, it is needed unserialized by computeRawError()
                    handlingStack: handlingStack,
                    context: (0, browser_core_1.sanitize)(context),
                    startClocks: (0, browser_core_1.clocksNow)(),
                });
                (0, browser_core_1.addTelemetryUsage)({ feature: 'add-error' });
            });
        },
        addTiming: (0, browser_core_1.monitor)(function (name, time) {
            // TODO: next major decide to drop relative time support or update its behaviour
            strategy.addTiming((0, browser_core_1.sanitize)(name), time);
        }),
        setUser: (0, browser_core_1.monitor)(function (newUser) {
            if ((0, browser_core_1.checkUser)(newUser)) {
                userContextManager.setContext((0, browser_core_1.sanitizeUser)(newUser));
            }
            (0, browser_core_1.addTelemetryUsage)({ feature: 'set-user' });
        }),
        getUser: (0, browser_core_1.monitor)(function () { return userContextManager.getContext(); }),
        setUserProperty: (0, browser_core_1.monitor)(function (key, property) {
            var _a;
            var sanitizedProperty = (0, browser_core_1.sanitizeUser)((_a = {}, _a[key] = property, _a))[key];
            userContextManager.setContextProperty(key, sanitizedProperty);
            (0, browser_core_1.addTelemetryUsage)({ feature: 'set-user' });
        }),
        removeUserProperty: (0, browser_core_1.monitor)(function (key) { return userContextManager.removeContextProperty(key); }),
        clearUser: (0, browser_core_1.monitor)(function () { return userContextManager.clearContext(); }),
        startView: startView,
        stopSession: (0, browser_core_1.monitor)(function () {
            strategy.stopSession();
            (0, browser_core_1.addTelemetryUsage)({ feature: 'stop-session' });
        }),
        addFeatureFlagEvaluation: (0, browser_core_1.monitor)(function (key, value) {
            strategy.addFeatureFlagEvaluation((0, browser_core_1.sanitize)(key), (0, browser_core_1.sanitize)(value));
            (0, browser_core_1.addTelemetryUsage)({ feature: 'add-feature-flag-evaluation' });
        }),
        getSessionReplayLink: (0, browser_core_1.monitor)(function () { return recorderApi.getSessionReplayLink(); }),
        startSessionReplayRecording: (0, browser_core_1.monitor)(function (options) {
            recorderApi.start(options);
            (0, browser_core_1.addTelemetryUsage)({ feature: 'start-session-replay-recording', force: options === null || options === void 0 ? void 0 : options.force });
        }),
        stopSessionReplayRecording: (0, browser_core_1.monitor)(function () { return recorderApi.stop(); }),
    });
    return rumPublicApi;
}
function createPostStartStrategy(preStartStrategy, startRumResult) {
    return (0, browser_core_1.assign)({
        init: function (initConfiguration) {
            (0, browser_core_1.displayAlreadyInitializedError)('DD_RUM', initConfiguration);
        },
        initConfiguration: preStartStrategy.initConfiguration,
    }, startRumResult);
}
//# sourceMappingURL=rumPublicApi.js.map