"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROPAGATOR_TYPES = void 0;
exports.validateAndBuildRumConfiguration = validateAndBuildRumConfiguration;
exports.serializeRumConfiguration = serializeRumConfiguration;
var browser_core_1 = require("@datadog/browser-core");
var tracer_1 = require("../tracing/tracer");
exports.DEFAULT_PROPAGATOR_TYPES = ['tracecontext', 'datadog'];
function validateAndBuildRumConfiguration(initConfiguration) {
    var _a, _b;
    if (!initConfiguration.applicationId) {
        browser_core_1.display.error('Application ID is not configured, no RUM data will be collected.');
        return;
    }
    if (initConfiguration.sessionReplaySampleRate !== undefined &&
        !(0, browser_core_1.isPercentage)(initConfiguration.sessionReplaySampleRate)) {
        browser_core_1.display.error('Session Replay Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.traceSampleRate !== undefined && !(0, browser_core_1.isPercentage)(initConfiguration.traceSampleRate)) {
        browser_core_1.display.error('Trace Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.excludedActivityUrls !== undefined && !Array.isArray(initConfiguration.excludedActivityUrls)) {
        browser_core_1.display.error('Excluded Activity Urls should be an array');
        return;
    }
    var allowedTracingUrls = validateAndBuildTracingOptions(initConfiguration);
    if (!allowedTracingUrls) {
        return;
    }
    var baseConfiguration = (0, browser_core_1.validateAndBuildConfiguration)(initConfiguration);
    if (!baseConfiguration) {
        return;
    }
    return (0, browser_core_1.assign)({
        applicationId: initConfiguration.applicationId,
        version: initConfiguration.version || undefined,
        actionNameAttribute: initConfiguration.actionNameAttribute,
        sessionReplaySampleRate: (_a = initConfiguration.sessionReplaySampleRate) !== null && _a !== void 0 ? _a : 0,
        startSessionReplayRecordingManually: !!initConfiguration.startSessionReplayRecordingManually,
        traceSampleRate: initConfiguration.traceSampleRate,
        allowedTracingUrls: allowedTracingUrls,
        excludedActivityUrls: (_b = initConfiguration.excludedActivityUrls) !== null && _b !== void 0 ? _b : [],
        workerUrl: initConfiguration.workerUrl,
        compressIntakeRequests: !!initConfiguration.compressIntakeRequests,
        trackUserInteractions: !!initConfiguration.trackUserInteractions,
        trackViewsManually: !!initConfiguration.trackViewsManually,
        trackResources: !!initConfiguration.trackResources,
        trackLongTasks: !!initConfiguration.trackLongTasks,
        subdomain: initConfiguration.subdomain,
        defaultPrivacyLevel: (0, browser_core_1.objectHasValue)(browser_core_1.DefaultPrivacyLevel, initConfiguration.defaultPrivacyLevel)
            ? initConfiguration.defaultPrivacyLevel
            : browser_core_1.DefaultPrivacyLevel.MASK,
        enablePrivacyForActionName: !!initConfiguration.enablePrivacyForActionName,
        customerDataTelemetrySampleRate: 1,
        traceContextInjection: (0, browser_core_1.objectHasValue)(browser_core_1.TraceContextInjection, initConfiguration.traceContextInjection)
            ? initConfiguration.traceContextInjection
            : browser_core_1.TraceContextInjection.ALL,
        plugins: ((0, browser_core_1.isExperimentalFeatureEnabled)(browser_core_1.ExperimentalFeature.PLUGINS) && initConfiguration.plugins) || [],
    }, baseConfiguration);
}
/**
 * Validates allowedTracingUrls and converts match options to tracing options
 */
function validateAndBuildTracingOptions(initConfiguration) {
    if (initConfiguration.allowedTracingUrls !== undefined) {
        if (!Array.isArray(initConfiguration.allowedTracingUrls)) {
            browser_core_1.display.error('Allowed Tracing URLs should be an array');
            return;
        }
        if (initConfiguration.allowedTracingUrls.length !== 0 && initConfiguration.service === undefined) {
            browser_core_1.display.error('Service needs to be configured when tracing is enabled');
            return;
        }
        // Convert from (MatchOption | TracingOption) to TracingOption, remove unknown properties
        var tracingOptions_1 = [];
        initConfiguration.allowedTracingUrls.forEach(function (option) {
            if ((0, browser_core_1.isMatchOption)(option)) {
                tracingOptions_1.push({ match: option, propagatorTypes: exports.DEFAULT_PROPAGATOR_TYPES });
            }
            else if ((0, tracer_1.isTracingOption)(option)) {
                tracingOptions_1.push(option);
            }
            else {
                browser_core_1.display.warn('Allowed Tracing Urls parameters should be a string, RegExp, function, or an object. Ignoring parameter', option);
            }
        });
        return tracingOptions_1;
    }
    return [];
}
/**
 * Combines the selected tracing propagators from the different options in allowedTracingUrls
 */
function getSelectedTracingPropagators(configuration) {
    var usedTracingPropagators = new Set();
    if (Array.isArray(configuration.allowedTracingUrls) && configuration.allowedTracingUrls.length > 0) {
        configuration.allowedTracingUrls.forEach(function (option) {
            if ((0, browser_core_1.isMatchOption)(option)) {
                exports.DEFAULT_PROPAGATOR_TYPES.forEach(function (propagatorType) { return usedTracingPropagators.add(propagatorType); });
            }
            else if ((0, browser_core_1.getType)(option) === 'object' && Array.isArray(option.propagatorTypes)) {
                // Ensure we have an array, as we cannot rely on types yet (configuration is provided by users)
                option.propagatorTypes.forEach(function (propagatorType) { return usedTracingPropagators.add(propagatorType); });
            }
        });
    }
    return (0, browser_core_1.arrayFrom)(usedTracingPropagators);
}
function serializeRumConfiguration(configuration) {
    var _a;
    var baseSerializedConfiguration = (0, browser_core_1.serializeConfiguration)(configuration);
    return (0, browser_core_1.assign)({
        session_replay_sample_rate: configuration.sessionReplaySampleRate,
        start_session_replay_recording_manually: configuration.startSessionReplayRecordingManually,
        trace_sample_rate: configuration.traceSampleRate,
        trace_context_injection: configuration.traceContextInjection,
        action_name_attribute: configuration.actionNameAttribute,
        use_allowed_tracing_urls: Array.isArray(configuration.allowedTracingUrls) && configuration.allowedTracingUrls.length > 0,
        selected_tracing_propagators: getSelectedTracingPropagators(configuration),
        default_privacy_level: configuration.defaultPrivacyLevel,
        enable_privacy_for_action_name: configuration.enablePrivacyForActionName,
        use_excluded_activity_urls: Array.isArray(configuration.excludedActivityUrls) && configuration.excludedActivityUrls.length > 0,
        use_worker_url: !!configuration.workerUrl,
        compress_intake_requests: configuration.compressIntakeRequests,
        track_views_manually: configuration.trackViewsManually,
        track_user_interactions: configuration.trackUserInteractions,
        track_resources: configuration.trackResources,
        track_long_task: configuration.trackLongTasks,
        plugins: (_a = configuration.plugins) === null || _a === void 0 ? void 0 : _a.map(function (plugin) { var _a; return (0, browser_core_1.assign)({ name: plugin.name }, (_a = plugin.getConfigurationTelemetry) === null || _a === void 0 ? void 0 : _a.call(plugin)); }),
    }, baseSerializedConfiguration);
}
//# sourceMappingURL=configuration.js.map