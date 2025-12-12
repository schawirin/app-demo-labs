"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreStartStrategy = createPreStartStrategy;
var browser_core_1 = require("@datadog/browser-core");
var configuration_1 = require("../domain/configuration");
var configuration_2 = require("../domain/configuration");
var plugins_1 = require("../domain/plugins");
function createPreStartStrategy(_a, getCommonContext, trackingConsentState, doStartRum) {
    var ignoreInitIfSyntheticsWillInjectRum = _a.ignoreInitIfSyntheticsWillInjectRum, startDeflateWorker = _a.startDeflateWorker;
    var bufferApiCalls = new browser_core_1.BoundedBuffer();
    var firstStartViewCall;
    var deflateWorker;
    var cachedInitConfiguration;
    var cachedConfiguration;
    var trackingConsentStateSubscription = trackingConsentState.observable.subscribe(tryStartRum);
    function tryStartRum() {
        if (!cachedInitConfiguration || !cachedConfiguration || !trackingConsentState.isGranted()) {
            return;
        }
        trackingConsentStateSubscription.unsubscribe();
        var initialViewOptions;
        if (cachedConfiguration.trackViewsManually) {
            if (!firstStartViewCall) {
                return;
            }
            // An initial view is always created when starting RUM.
            // When tracking views automatically, any startView call before RUM start creates an extra
            // view.
            // When tracking views manually, we use the ViewOptions from the first startView call as the
            // initial view options, and we remove the actual startView call so we don't create an extra
            // view.
            bufferApiCalls.remove(firstStartViewCall.callback);
            initialViewOptions = firstStartViewCall.options;
        }
        var startRumResult = doStartRum(cachedConfiguration, deflateWorker, initialViewOptions);
        bufferApiCalls.drain(startRumResult);
    }
    function doInit(initConfiguration) {
        var eventBridgeAvailable = (0, browser_core_1.canUseEventBridge)();
        if (eventBridgeAvailable) {
            initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
        }
        // Update the exposed initConfiguration to reflect the bridge and remote configuration overrides
        cachedInitConfiguration = initConfiguration;
        (0, browser_core_1.addTelemetryConfiguration)((0, configuration_2.serializeRumConfiguration)(initConfiguration));
        if (cachedConfiguration) {
            (0, browser_core_1.displayAlreadyInitializedError)('DD_RUM', initConfiguration);
            return;
        }
        var configuration = (0, configuration_1.validateAndBuildRumConfiguration)(initConfiguration);
        if (!configuration) {
            return;
        }
        if (!eventBridgeAvailable && !configuration.sessionStoreStrategyType) {
            browser_core_1.display.warn('No storage available for session. We will not send any data.');
            return;
        }
        if (configuration.compressIntakeRequests && !eventBridgeAvailable && startDeflateWorker) {
            deflateWorker = startDeflateWorker(configuration, 'Datadog RUM', 
            // Worker initialization can fail asynchronously, especially in Firefox where even CSP
            // issues are reported asynchronously. For now, the SDK will continue its execution even if
            // data won't be sent to Datadog. We could improve this behavior in the future.
            browser_core_1.noop);
            if (!deflateWorker) {
                // `startDeflateWorker` should have logged an error message explaining the issue
                return;
            }
        }
        cachedConfiguration = configuration;
        trackingConsentState.tryToInit(configuration.trackingConsent);
        tryStartRum();
    }
    return {
        init: function (initConfiguration, publicApi) {
            if (!initConfiguration) {
                browser_core_1.display.error('Missing configuration');
                return;
            }
            // Set the experimental feature flags as early as possible, so we can use them in most places
            (0, browser_core_1.initFeatureFlags)(initConfiguration.enableExperimentalFeatures);
            // Expose the initial configuration regardless of initialization success.
            cachedInitConfiguration = initConfiguration;
            // If we are in a Synthetics test configured to automatically inject a RUM instance, we want
            // to completely discard the customer application RUM instance by ignoring their init() call.
            // But, we should not ignore the init() call from the Synthetics-injected RUM instance, so the
            // internal `ignoreInitIfSyntheticsWillInjectRum` option is here to bypass this condition.
            if (ignoreInitIfSyntheticsWillInjectRum && (0, browser_core_1.willSyntheticsInjectRum)()) {
                return;
            }
            if ((0, browser_core_1.isExperimentalFeatureEnabled)(browser_core_1.ExperimentalFeature.PLUGINS)) {
                (0, plugins_1.callPluginsMethod)(initConfiguration.plugins, 'onInit', { initConfiguration: initConfiguration, publicApi: publicApi });
            }
            if (initConfiguration.remoteConfigurationId &&
                (0, browser_core_1.isExperimentalFeatureEnabled)(browser_core_1.ExperimentalFeature.REMOTE_CONFIGURATION)) {
                (0, configuration_2.fetchAndApplyRemoteConfiguration)(initConfiguration, doInit);
            }
            else {
                doInit(initConfiguration);
            }
        },
        get initConfiguration() {
            return cachedInitConfiguration;
        },
        getInternalContext: browser_core_1.noop,
        stopSession: browser_core_1.noop,
        addTiming: function (name, time) {
            if (time === void 0) { time = (0, browser_core_1.timeStampNow)(); }
            bufferApiCalls.add(function (startRumResult) { return startRumResult.addTiming(name, time); });
        },
        startView: function (options, startClocks) {
            if (startClocks === void 0) { startClocks = (0, browser_core_1.clocksNow)(); }
            var callback = function (startRumResult) {
                startRumResult.startView(options, startClocks);
            };
            bufferApiCalls.add(callback);
            if (!firstStartViewCall) {
                firstStartViewCall = { options: options, callback: callback };
                tryStartRum();
            }
        },
        addAction: function (action, commonContext) {
            if (commonContext === void 0) { commonContext = getCommonContext(); }
            bufferApiCalls.add(function (startRumResult) { return startRumResult.addAction(action, commonContext); });
        },
        addError: function (providedError, commonContext) {
            if (commonContext === void 0) { commonContext = getCommonContext(); }
            bufferApiCalls.add(function (startRumResult) { return startRumResult.addError(providedError, commonContext); });
        },
        addFeatureFlagEvaluation: function (key, value) {
            bufferApiCalls.add(function (startRumResult) { return startRumResult.addFeatureFlagEvaluation(key, value); });
        },
        startDurationVital: function (vitalStart) {
            bufferApiCalls.add(function (startRumResult) { return startRumResult.startDurationVital(vitalStart); });
        },
        stopDurationVital: function (vitalStart) {
            bufferApiCalls.add(function (startRumResult) { return startRumResult.stopDurationVital(vitalStart); });
        },
    };
}
function overrideInitConfigurationForBridge(initConfiguration) {
    var _a, _b;
    return (0, browser_core_1.assign)({}, initConfiguration, {
        applicationId: '00000000-aaaa-0000-aaaa-000000000000',
        clientToken: 'empty',
        sessionSampleRate: 100,
        defaultPrivacyLevel: (_a = initConfiguration.defaultPrivacyLevel) !== null && _a !== void 0 ? _a : (_b = (0, browser_core_1.getEventBridge)()) === null || _b === void 0 ? void 0 : _b.getPrivacyLevel(),
    });
}
//# sourceMappingURL=preStartRum.js.map