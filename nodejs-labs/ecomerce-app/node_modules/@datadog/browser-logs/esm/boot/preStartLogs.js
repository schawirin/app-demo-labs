import { BoundedBuffer, assign, canUseEventBridge, display, displayAlreadyInitializedError, initFeatureFlags, noop, timeStampNow, } from '@datadog/browser-core';
import { validateAndBuildLogsConfiguration, } from '../domain/configuration';
export function createPreStartStrategy(getCommonContext, trackingConsentState, doStartLogs) {
    var bufferApiCalls = new BoundedBuffer();
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
                display.error('Missing configuration');
                return;
            }
            // Set the experimental feature flags as early as possible, so we can use them in most places
            initFeatureFlags(initConfiguration.enableExperimentalFeatures);
            if (canUseEventBridge()) {
                initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
            }
            // Expose the initial configuration regardless of initialization success.
            cachedInitConfiguration = initConfiguration;
            if (cachedConfiguration) {
                displayAlreadyInitializedError('DD_LOGS', initConfiguration);
                return;
            }
            var configuration = validateAndBuildLogsConfiguration(initConfiguration);
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
        getInternalContext: noop,
        handleLog: function (message, statusType, handlingStack, context, date) {
            if (context === void 0) { context = getCommonContext(); }
            if (date === void 0) { date = timeStampNow(); }
            bufferApiCalls.add(function (startLogsResult) {
                return startLogsResult.handleLog(message, statusType, handlingStack, context, date);
            });
        },
    };
}
function overrideInitConfigurationForBridge(initConfiguration) {
    return assign({}, initConfiguration, { clientToken: 'empty' });
}
//# sourceMappingURL=preStartLogs.js.map