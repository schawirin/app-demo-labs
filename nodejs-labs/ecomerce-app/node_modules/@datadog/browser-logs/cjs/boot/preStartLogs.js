"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreStartStrategy = createPreStartStrategy;
var browser_core_1 = require("@datadog/browser-core");
var configuration_1 = require("../domain/configuration");
function createPreStartStrategy(getCommonContext, trackingConsentState, doStartLogs) {
    var bufferApiCalls = new browser_core_1.BoundedBuffer();
    var cachedInitConfiguration;
    var cachedConfiguration;
    var trackingConsentStateSubscription = trackingConsentState.observable.subscribe(tryStartLogs);
    function tryStartLogs() {
        if (!cachedConfiguration || !cachedInitConfiguration || !trackingConsentState.isGranted()) {
            return;
        }
        trackingConsentStateSubscription.unsubscribe();
        var startLogsResult = doStartLogs(cachedInitConfiguration, cachedConfiguration);
        bufferApiCalls.drain(startLogsResult);
    }
    return {
        init: function (initConfiguration) {
            if (!initConfiguration) {
                browser_core_1.display.error('Missing configuration');
                return;
            }
            // Set the experimental feature flags as early as possible, so we can use them in most places
            (0, browser_core_1.initFeatureFlags)(initConfiguration.enableExperimentalFeatures);
            if ((0, browser_core_1.canUseEventBridge)()) {
                initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
            }
            // Expose the initial configuration regardless of initialization success.
            cachedInitConfiguration = initConfiguration;
            if (cachedConfiguration) {
                (0, browser_core_1.displayAlreadyInitializedError)('DD_LOGS', initConfiguration);
                return;
            }
            var configuration = (0, configuration_1.validateAndBuildLogsConfiguration)(initConfiguration);
            if (!configuration) {
                return;
            }
            cachedConfiguration = configuration;
            trackingConsentState.tryToInit(configuration.trackingConsent);
            tryStartLogs();
        },
        get initConfiguration() {
            return cachedInitConfiguration;
        },
        getInternalContext: browser_core_1.noop,
        handleLog: function (message, statusType, handlingStack, context, date) {
            if (context === void 0) { context = getCommonContext(); }
            if (date === void 0) { date = (0, browser_core_1.timeStampNow)(); }
            bufferApiCalls.add(function (startLogsResult) {
                return startLogsResult.handleLog(message, statusType, handlingStack, context, date);
            });
        },
    };
}
function overrideInitConfigurationForBridge(initConfiguration) {
    return (0, browser_core_1.assign)({}, initConfiguration, { clientToken: 'empty' });
}
//# sourceMappingURL=preStartLogs.js.map