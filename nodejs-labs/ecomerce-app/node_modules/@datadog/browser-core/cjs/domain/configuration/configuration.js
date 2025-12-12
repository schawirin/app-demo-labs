"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceContextInjection = exports.DefaultPrivacyLevel = void 0;
exports.validateAndBuildConfiguration = validateAndBuildConfiguration;
exports.serializeConfiguration = serializeConfiguration;
var catchUserErrors_1 = require("../../tools/catchUserErrors");
var display_1 = require("../../tools/display");
var timeUtils_1 = require("../../tools/utils/timeUtils");
var numberUtils_1 = require("../../tools/utils/numberUtils");
var byteUtils_1 = require("../../tools/utils/byteUtils");
var objectUtils_1 = require("../../tools/utils/objectUtils");
var polyfills_1 = require("../../tools/utils/polyfills");
var sessionStore_1 = require("../session/sessionStore");
var trackingConsent_1 = require("../trackingConsent");
var transportConfiguration_1 = require("./transportConfiguration");
exports.DefaultPrivacyLevel = {
    ALLOW: 'allow',
    MASK: 'mask',
    MASK_USER_INPUT: 'mask-user-input',
};
exports.TraceContextInjection = {
    ALL: 'all',
    SAMPLED: 'sampled',
};
function checkIfString(tag, tagName) {
    if (tag !== undefined && tag !== null && typeof tag !== 'string') {
        display_1.display.error("".concat(tagName, " must be defined as a string"));
        return false;
    }
    return true;
}
function isDatadogSite(site) {
    return /(datadog|ddog|datad0g|dd0g)/.test(site);
}
function validateAndBuildConfiguration(initConfiguration) {
    var _a, _b, _c, _d, _e;
    if (!initConfiguration || !initConfiguration.clientToken) {
        display_1.display.error('Client Token is not configured, we will not send any data.');
        return;
    }
    if (initConfiguration.sessionSampleRate !== undefined && !(0, numberUtils_1.isPercentage)(initConfiguration.sessionSampleRate)) {
        display_1.display.error('Session Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetrySampleRate !== undefined && !(0, numberUtils_1.isPercentage)(initConfiguration.telemetrySampleRate)) {
        display_1.display.error('Telemetry Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetryConfigurationSampleRate !== undefined &&
        !(0, numberUtils_1.isPercentage)(initConfiguration.telemetryConfigurationSampleRate)) {
        display_1.display.error('Telemetry Configuration Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetryUsageSampleRate !== undefined &&
        !(0, numberUtils_1.isPercentage)(initConfiguration.telemetryUsageSampleRate)) {
        display_1.display.error('Telemetry Usage Sample Rate should be a number between 0 and 100');
        return;
    }
    if (!checkIfString(initConfiguration.version, 'Version')) {
        return;
    }
    if (!checkIfString(initConfiguration.env, 'Env')) {
        return;
    }
    if (!checkIfString(initConfiguration.service, 'Service')) {
        return;
    }
    if (initConfiguration.trackingConsent !== undefined &&
        !(0, objectUtils_1.objectHasValue)(trackingConsent_1.TrackingConsent, initConfiguration.trackingConsent)) {
        display_1.display.error('Tracking Consent should be either "granted" or "not-granted"');
        return;
    }
    if (initConfiguration.site && !isDatadogSite(initConfiguration.site)) {
        display_1.display.error("Site should be a valid Datadog site. Learn more here: ".concat(display_1.DOCS_ORIGIN, "/getting_started/site/."));
        return;
    }
    return (0, polyfills_1.assign)({
        beforeSend: initConfiguration.beforeSend && (0, catchUserErrors_1.catchUserErrors)(initConfiguration.beforeSend, 'beforeSend threw an error:'),
        sessionStoreStrategyType: (0, sessionStore_1.selectSessionStoreStrategyType)(initConfiguration),
        sessionSampleRate: (_a = initConfiguration.sessionSampleRate) !== null && _a !== void 0 ? _a : 100,
        telemetrySampleRate: (_b = initConfiguration.telemetrySampleRate) !== null && _b !== void 0 ? _b : 20,
        telemetryConfigurationSampleRate: (_c = initConfiguration.telemetryConfigurationSampleRate) !== null && _c !== void 0 ? _c : 5,
        telemetryUsageSampleRate: (_d = initConfiguration.telemetryUsageSampleRate) !== null && _d !== void 0 ? _d : 5,
        service: initConfiguration.service || undefined,
        silentMultipleInit: !!initConfiguration.silentMultipleInit,
        allowUntrustedEvents: !!initConfiguration.allowUntrustedEvents,
        trackingConsent: (_e = initConfiguration.trackingConsent) !== null && _e !== void 0 ? _e : trackingConsent_1.TrackingConsent.GRANTED,
        storeContextsAcrossPages: !!initConfiguration.storeContextsAcrossPages,
        /**
         * beacon payload max queue size implementation is 64kb
         * ensure that we leave room for logs, rum and potential other users
         */
        batchBytesLimit: 16 * byteUtils_1.ONE_KIBI_BYTE,
        eventRateLimiterThreshold: 3000,
        maxTelemetryEventsPerPage: 15,
        /**
         * flush automatically, aim to be lower than ALB connection timeout
         * to maximize connection reuse.
         */
        flushTimeout: (30 * timeUtils_1.ONE_SECOND),
        /**
         * Logs intake limit
         */
        batchMessagesLimit: 50,
        messageBytesLimit: 256 * byteUtils_1.ONE_KIBI_BYTE,
    }, (0, transportConfiguration_1.computeTransportConfiguration)(initConfiguration));
}
function serializeConfiguration(initConfiguration) {
    return {
        session_sample_rate: initConfiguration.sessionSampleRate,
        telemetry_sample_rate: initConfiguration.telemetrySampleRate,
        telemetry_configuration_sample_rate: initConfiguration.telemetryConfigurationSampleRate,
        telemetry_usage_sample_rate: initConfiguration.telemetryUsageSampleRate,
        use_before_send: !!initConfiguration.beforeSend,
        use_cross_site_session_cookie: initConfiguration.useCrossSiteSessionCookie,
        use_partitioned_cross_site_session_cookie: initConfiguration.usePartitionedCrossSiteSessionCookie,
        use_secure_session_cookie: initConfiguration.useSecureSessionCookie,
        use_proxy: !!initConfiguration.proxy,
        silent_multiple_init: initConfiguration.silentMultipleInit,
        track_session_across_subdomains: initConfiguration.trackSessionAcrossSubdomains,
        allow_fallback_to_local_storage: !!initConfiguration.allowFallbackToLocalStorage,
        store_contexts_across_pages: !!initConfiguration.storeContextsAcrossPages,
        allow_untrusted_events: !!initConfiguration.allowUntrustedEvents,
        tracking_consent: initConfiguration.trackingConsent,
    };
}
//# sourceMappingURL=configuration.js.map