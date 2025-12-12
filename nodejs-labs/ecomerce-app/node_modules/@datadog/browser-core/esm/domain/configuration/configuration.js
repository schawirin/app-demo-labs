import { catchUserErrors } from '../../tools/catchUserErrors';
import { DOCS_ORIGIN, display } from '../../tools/display';
import { ONE_SECOND } from '../../tools/utils/timeUtils';
import { isPercentage } from '../../tools/utils/numberUtils';
import { ONE_KIBI_BYTE } from '../../tools/utils/byteUtils';
import { objectHasValue } from '../../tools/utils/objectUtils';
import { assign } from '../../tools/utils/polyfills';
import { selectSessionStoreStrategyType } from '../session/sessionStore';
import { TrackingConsent } from '../trackingConsent';
import { computeTransportConfiguration } from './transportConfiguration';
export var DefaultPrivacyLevel = {
    ALLOW: 'allow',
    MASK: 'mask',
    MASK_USER_INPUT: 'mask-user-input',
};
export var TraceContextInjection = {
    ALL: 'all',
    SAMPLED: 'sampled',
};
function checkIfString(tag, tagName) {
    if (tag !== undefined && tag !== null && typeof tag !== 'string') {
        display.error("".concat(tagName, " must be defined as a string"));
        return false;
    }
    return true;
}
function isDatadogSite(site) {
    return /(datadog|ddog|datad0g|dd0g)/.test(site);
}
export function validateAndBuildConfiguration(initConfiguration) {
    var _a, _b, _c, _d, _e;
    if (!initConfiguration || !initConfiguration.clientToken) {
        display.error('Client Token is not configured, we will not send any data.');
        return;
    }
    if (initConfiguration.sessionSampleRate !== undefined && !isPercentage(initConfiguration.sessionSampleRate)) {
        display.error('Session Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetrySampleRate !== undefined && !isPercentage(initConfiguration.telemetrySampleRate)) {
        display.error('Telemetry Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetryConfigurationSampleRate !== undefined &&
        !isPercentage(initConfiguration.telemetryConfigurationSampleRate)) {
        display.error('Telemetry Configuration Sample Rate should be a number between 0 and 100');
        return;
    }
    if (initConfiguration.telemetryUsageSampleRate !== undefined &&
        !isPercentage(initConfiguration.telemetryUsageSampleRate)) {
        display.error('Telemetry Usage Sample Rate should be a number between 0 and 100');
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
        !objectHasValue(TrackingConsent, initConfiguration.trackingConsent)) {
        display.error('Tracking Consent should be either "granted" or "not-granted"');
        return;
    }
    if (initConfiguration.site && !isDatadogSite(initConfiguration.site)) {
        display.error("Site should be a valid Datadog site. Learn more here: ".concat(DOCS_ORIGIN, "/getting_started/site/."));
        return;
    }
    return assign({
        beforeSend: initConfiguration.beforeSend && catchUserErrors(initConfiguration.beforeSend, 'beforeSend threw an error:'),
        sessionStoreStrategyType: selectSessionStoreStrategyType(initConfiguration),
        sessionSampleRate: (_a = initConfiguration.sessionSampleRate) !== null && _a !== void 0 ? _a : 100,
        telemetrySampleRate: (_b = initConfiguration.telemetrySampleRate) !== null && _b !== void 0 ? _b : 20,
        telemetryConfigurationSampleRate: (_c = initConfiguration.telemetryConfigurationSampleRate) !== null && _c !== void 0 ? _c : 5,
        telemetryUsageSampleRate: (_d = initConfiguration.telemetryUsageSampleRate) !== null && _d !== void 0 ? _d : 5,
        service: initConfiguration.service || undefined,
        silentMultipleInit: !!initConfiguration.silentMultipleInit,
        allowUntrustedEvents: !!initConfiguration.allowUntrustedEvents,
        trackingConsent: (_e = initConfiguration.trackingConsent) !== null && _e !== void 0 ? _e : TrackingConsent.GRANTED,
        storeContextsAcrossPages: !!initConfiguration.storeContextsAcrossPages,
        /**
         * beacon payload max queue size implementation is 64kb
         * ensure that we leave room for logs, rum and potential other users
         */
        batchBytesLimit: 16 * ONE_KIBI_BYTE,
        eventRateLimiterThreshold: 3000,
        maxTelemetryEventsPerPage: 15,
        /**
         * flush automatically, aim to be lower than ALB connection timeout
         * to maximize connection reuse.
         */
        flushTimeout: (30 * ONE_SECOND),
        /**
         * Logs intake limit
         */
        batchMessagesLimit: 50,
        messageBytesLimit: 256 * ONE_KIBI_BYTE,
    }, computeTransportConfiguration(initConfiguration));
}
export function serializeConfiguration(initConfiguration) {
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