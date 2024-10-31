import { addTelemetryUsage, timeStampToClocks, isExperimentalFeatureEnabled, ExperimentalFeature, assign, createContextManager, deepClone, makePublicApi, monitor, clocksNow, callMonitored, createHandlingStack, checkUser, sanitizeUser, sanitize, createIdentityEncoder, createCustomerDataTrackerManager, storeContextManager, displayAlreadyInitializedError, createTrackingConsentState, } from '@datadog/browser-core';
import { buildCommonContext } from '../domain/contexts/commonContext';
import { createPreStartStrategy } from './preStartRum';
var RUM_STORAGE_KEY = 'rum';
export function makeRumPublicApi(startRumImpl, recorderApi, options) {
    if (options === void 0) { options = {}; }
    var customerDataTrackerManager = createCustomerDataTrackerManager(0 /* CustomerDataCompressionStatus.Unknown */);
    var globalContextManager = createContextManager(customerDataTrackerManager.getOrCreateTracker(2 /* CustomerDataType.GlobalContext */));
    var userContextManager = createContextManager(customerDataTrackerManager.getOrCreateTracker(1 /* CustomerDataType.User */));
    var trackingConsentState = createTrackingConsentState();
    function getCommonContext() {
        return buildCommonContext(globalContextManager, userContextManager, recorderApi);
    }
    var strategy = createPreStartStrategy(options, getCommonContext, trackingConsentState, function (configuration, deflateWorker, initialViewOptions) {
        if (isExperimentalFeatureEnabled(ExperimentalFeature.CUSTOM_VITALS)) {
            /**
             * Start a custom duration vital
             * stored in @vital.custom.<name>
             *
             * @param name name of the custom vital
             * @param options.context custom context attached to the vital
             * @param options.startTime epoch timestamp of the start of the custom vital (if not set, will use current time)
             */
            ;
            rumPublicApi.startDurationVital = monitor(function (name, options) {
                strategy.startDurationVital({
                    name: sanitize(name),
                    startClocks: (options === null || options === void 0 ? void 0 : options.startTime) ? timeStampToClocks(options.startTime) : clocksNow(),
                    context: sanitize(options === null || options === void 0 ? void 0 : options.context),
                });
                addTelemetryUsage({ feature: 'start-duration-vital' });
            });
            rumPublicApi.stopDurationVital = monitor(function (name, options) {
                strategy.stopDurationVital({
                    name: sanitize(name),
                    stopClocks: (options === null || options === void 0 ? void 0 : options.stopTime) ? timeStampToClocks(options.stopTime) : clocksNow(),
                    context: sanitize(options === null || options === void 0 ? void 0 : options.context),
                });
            });
        }
        if (configuration.storeContextsAcrossPages) {
            storeContextManager(configuration, globalContextManager, RUM_STORAGE_KEY, 2 /* CustomerDataType.GlobalContext */);
            storeContextManager(configuration, userContextManager, RUM_STORAGE_KEY, 1 /* CustomerDataType.User */);
        }
        customerDataTrackerManager.setCompressionStatus(deflateWorker ? 1 /* CustomerDataCompressionStatus.Enabled */ : 2 /* CustomerDataCompressionStatus.Disabled */);
        var startRumResult = startRumImpl(configuration, recorderApi, customerDataTrackerManager, getCommonContext, initialViewOptions, deflateWorker && options.createDeflateEncoder
            ? function (streamId) { return options.createDeflateEncoder(configuration, deflateWorker, streamId); }
            : createIdentityEncoder, trackingConsentState);
        recorderApi.onRumStart(startRumResult.lifeCycle, configuration, startRumResult.session, startRumResult.viewContexts, deflateWorker);
        strategy = createPostStartStrategy(strategy, startRumResult);
        return startRumResult;
    });
    var startView = monitor(function (options) {
        var sanitizedOptions = typeof options === 'object' ? options : { name: options };
        strategy.startView(sanitizedOptions);
        addTelemetryUsage({ feature: 'start-view' });
    });
    var rumPublicApi = makePublicApi({
        init: monitor(function (initConfiguration) { return strategy.init(initConfiguration, rumPublicApi); }),
        setTrackingConsent: monitor(function (trackingConsent) {
            trackingConsentState.update(trackingConsent);
            addTelemetryUsage({ feature: 'set-tracking-consent', tracking_consent: trackingConsent });
        }),
        setGlobalContext: monitor(function (context) {
            globalContextManager.setContext(context);
            addTelemetryUsage({ feature: 'set-global-context' });
        }),
        getGlobalContext: monitor(function () { return globalContextManager.getContext(); }),
        setGlobalContextProperty: monitor(function (key, value) {
            globalContextManager.setContextProperty(key, value);
            addTelemetryUsage({ feature: 'set-global-context' });
        }),
        removeGlobalContextProperty: monitor(function (key) { return globalContextManager.removeContextProperty(key); }),
        clearGlobalContext: monitor(function () { return globalContextManager.clearContext(); }),
        getInternalContext: monitor(function (startTime) { return strategy.getInternalContext(startTime); }),
        getInitConfiguration: monitor(function () { return deepClone(strategy.initConfiguration); }),
        addAction: function (name, context) {
            var handlingStack = createHandlingStack();
            callMonitored(function () {
                strategy.addAction({
                    name: sanitize(name),
                    context: sanitize(context),
                    startClocks: clocksNow(),
                    type: "custom" /* ActionType.CUSTOM */,
                    handlingStack: handlingStack,
                });
                addTelemetryUsage({ feature: 'add-action' });
            });
        },
        addError: function (error, context) {
            var handlingStack = createHandlingStack();
            callMonitored(function () {
                strategy.addError({
                    error: error, // Do not sanitize error here, it is needed unserialized by computeRawError()
                    handlingStack: handlingStack,
                    context: sanitize(context),
                    startClocks: clocksNow(),
                });
                addTelemetryUsage({ feature: 'add-error' });
            });
        },
        addTiming: monitor(function (name, time) {
            // TODO: next major decide to drop relative time support or update its behaviour
            strategy.addTiming(sanitize(name), time);
        }),
        setUser: monitor(function (newUser) {
            if (checkUser(newUser)) {
                userContextManager.setContext(sanitizeUser(newUser));
            }
            addTelemetryUsage({ feature: 'set-user' });
        }),
        getUser: monitor(function () { return userContextManager.getContext(); }),
        setUserProperty: monitor(function (key, property) {
            var _a;
            var sanitizedProperty = sanitizeUser((_a = {}, _a[key] = property, _a))[key];
            userContextManager.setContextProperty(key, sanitizedProperty);
            addTelemetryUsage({ feature: 'set-user' });
        }),
        removeUserProperty: monitor(function (key) { return userContextManager.removeContextProperty(key); }),
        clearUser: monitor(function () { return userContextManager.clearContext(); }),
        startView: startView,
        stopSession: monitor(function () {
            strategy.stopSession();
            addTelemetryUsage({ feature: 'stop-session' });
        }),
        addFeatureFlagEvaluation: monitor(function (key, value) {
            strategy.addFeatureFlagEvaluation(sanitize(key), sanitize(value));
            addTelemetryUsage({ feature: 'add-feature-flag-evaluation' });
        }),
        getSessionReplayLink: monitor(function () { return recorderApi.getSessionReplayLink(); }),
        startSessionReplayRecording: monitor(function (options) {
            recorderApi.start(options);
            addTelemetryUsage({ feature: 'start-session-replay-recording', force: options === null || options === void 0 ? void 0 : options.force });
        }),
        stopSessionReplayRecording: monitor(function () { return recorderApi.stop(); }),
    });
    return rumPublicApi;
}
function createPostStartStrategy(preStartStrategy, startRumResult) {
    return assign({
        init: function (initConfiguration) {
            displayAlreadyInitializedError('DD_RUM', initConfiguration);
        },
        initConfiguration: preStartStrategy.initConfiguration,
    }, startRumResult);
}
//# sourceMappingURL=rumPublicApi.js.map