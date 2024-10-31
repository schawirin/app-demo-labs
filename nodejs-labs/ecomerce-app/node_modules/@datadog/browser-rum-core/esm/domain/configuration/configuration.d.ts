import type { Configuration, InitConfiguration, MatchOption } from '@datadog/browser-core';
import { DefaultPrivacyLevel, TraceContextInjection } from '@datadog/browser-core';
import type { RumEventDomainContext } from '../../domainContext.types';
import type { RumEvent } from '../../rumEvent.types';
import type { RumPlugin } from '../plugins';
import type { PropagatorType, TracingOption } from '../tracing/tracer.types';
export declare const DEFAULT_PROPAGATOR_TYPES: PropagatorType[];
export interface RumInitConfiguration extends InitConfiguration {
    /**
     * The RUM application ID.
     */
    applicationId: string;
    /**
     * Access to every event collected by the RUM SDK before they are sent to Datadog.
     * It allows:
     * - Enrich your RUM events with additional context attributes
     * - Modify your RUM events to modify their content, or redact sensitive sequences (see the list of editable properties)
     * - Discard selected RUM events
     *
     * See [Enrich And Control Browser RUM Data With beforeSend](https://docs.datadoghq.com/real_user_monitoring/guide/enrich-and-control-rum-data) for further information.
     */
    beforeSend?: ((event: RumEvent, context: RumEventDomainContext) => boolean) | undefined;
    /**
     * A list of request origins ignored when computing the page activity.
     * See [How page activity is calculated](https://docs.datadoghq.com/real_user_monitoring/browser/monitoring_page_performance/#how-page-activity-is-calculated) for further information.
     */
    excludedActivityUrls?: MatchOption[] | undefined;
    /**
     * URL pointing to the Datadog Browser SDK Worker JavaScript file. The URL can be relative or absolute, but is required to have the same origin as the web application.
     * See [Content Security Policy guidelines](https://docs.datadoghq.com/integrations/content_security_policy_logs/?tab=firefox#use-csp-with-real-user-monitoring-and-session-replay) for further information.
     */
    workerUrl?: string;
    /**
     * Compress requests sent to the Datadog intake to reduce bandwidth usage when sending large amounts of data. The compression is done in a Worker thread.
     * See [Content Security Policy guidelines](https://docs.datadoghq.com/integrations/content_security_policy_logs/?tab=firefox#use-csp-with-real-user-monitoring-and-session-replay) for further information.
     */
    compressIntakeRequests?: boolean | undefined;
    remoteConfigurationId?: string | undefined;
    /**
     * A list of request URLs used to inject tracing headers.
     * See [Connect RUM and Traces](https://docs.datadoghq.com/real_user_monitoring/platform/connect_rum_and_traces/?tab=browserrum) for further information.
     */
    allowedTracingUrls?: Array<MatchOption | TracingOption> | undefined;
    /**
     * The percentage of requests to trace: 100 for all, 0 for none.
     * See [Connect RUM and Traces](https://docs.datadoghq.com/real_user_monitoring/platform/connect_rum_and_traces/?tab=browserrum) for further information.
     */
    traceSampleRate?: number | undefined;
    /**
     * If you set a `traceSampleRate`, to ensure backend services' sampling decisions are still applied, configure the `traceContextInjection` initialization parameter to sampled.
     * @default all
     * See [Connect RUM and Traces](https://docs.datadoghq.com/real_user_monitoring/platform/connect_rum_and_traces/?tab=browserrum) for further information.
     */
    traceContextInjection?: TraceContextInjection | undefined;
    /**
     * Allow to protect end user privacy and prevent sensitive organizational information from being collected.
     * @default mask
     * See [Replay Privacy Options](https://docs.datadoghq.com/real_user_monitoring/session_replay/browser/privacy_options) for further information.
     */
    defaultPrivacyLevel?: DefaultPrivacyLevel | undefined;
    /**
     * If you are accessing Datadog through a custom subdomain, you can set `subdomain` to include your custom domain in the `getSessionReplayLink()` returned URL .
     * See [Connect Session Replay To Your Third-Party Tools](https://docs.datadoghq.com/real_user_monitoring/guide/connect-session-replay-to-your-third-party-tools) for further information.
     */
    subdomain?: string;
    /**
     * The percentage of tracked sessions with [Browser RUM & Session Replay pricing](https://www.datadoghq.com/pricing/?product=real-user-monitoring--session-replay#real-user-monitoring--session-replay) features: 100 for all, 0 for none.
     * See [Configure Your Setup For Browser RUM and Browser RUM & Session Replay Sampling](https://docs.datadoghq.com/real_user_monitoring/guide/sampling-browser-plans) for further information.
     */
    sessionReplaySampleRate?: number | undefined;
    /**
     * If the session is sampled for Session Replay, only start the recording when `startSessionReplayRecording()` is called, instead of at the beginning of the session.
     * See [Session Replay Usage](https://docs.datadoghq.com/real_user_monitoring/session_replay/browser/#usage) for further information.
     */
    startSessionReplayRecordingManually?: boolean | undefined;
    /**
     * Enables privacy control for action names.
     */
    enablePrivacyForActionName?: boolean | undefined;
    /**
     * Enables automatic collection of users actions.
     * See [Tracking User Actions](https://docs.datadoghq.com/real_user_monitoring/browser/tracking_user_actions) for further information.
     */
    trackUserInteractions?: boolean | undefined;
    /**
     * Specify your own attribute to use to name actions.
     * See [Declare a name for click actions](https://docs.datadoghq.com/real_user_monitoring/browser/tracking_user_actions/#declare-a-name-for-click-actions) for further information.
     */
    actionNameAttribute?: string | undefined;
    /**
     * Allows you to control RUM views creation. See [Override default RUM view names](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/?tab=npm#override-default-rum-view-names) for further information.
     */
    trackViewsManually?: boolean | undefined;
    /**
     * Enables collection of resource events.
     */
    trackResources?: boolean | undefined;
    /**
     * Enables collection of long task events.
     */
    trackLongTasks?: boolean | undefined;
    /**
     * List of plugins to enable. The plugins API is unstable and experimental, and may change without
     * notice. Please use only plugins provided by Datadog matching the version of the SDK you are
     * using.
     */
    plugins?: RumPlugin[] | undefined;
}
export type HybridInitConfiguration = Omit<RumInitConfiguration, 'applicationId' | 'clientToken'>;
export interface RumConfiguration extends Configuration {
    actionNameAttribute: string | undefined;
    traceSampleRate: number | undefined;
    allowedTracingUrls: TracingOption[];
    excludedActivityUrls: MatchOption[];
    workerUrl: string | undefined;
    compressIntakeRequests: boolean;
    applicationId: string;
    defaultPrivacyLevel: DefaultPrivacyLevel;
    enablePrivacyForActionName: boolean;
    sessionReplaySampleRate: number;
    startSessionReplayRecordingManually: boolean;
    trackUserInteractions: boolean;
    trackViewsManually: boolean;
    trackResources: boolean;
    trackLongTasks: boolean;
    version?: string;
    subdomain?: string;
    customerDataTelemetrySampleRate: number;
    traceContextInjection: TraceContextInjection;
    plugins: RumPlugin[];
}
export declare function validateAndBuildRumConfiguration(initConfiguration: RumInitConfiguration): RumConfiguration | undefined;
export declare function serializeRumConfiguration(configuration: RumInitConfiguration): {
    session_replay_sample_rate: number | undefined;
    start_session_replay_recording_manually: boolean | undefined;
    trace_sample_rate: number | undefined;
    trace_context_injection: TraceContextInjection | undefined;
    action_name_attribute: string | undefined;
    use_allowed_tracing_urls: boolean;
    selected_tracing_propagators: PropagatorType[];
    default_privacy_level: DefaultPrivacyLevel | undefined;
    enable_privacy_for_action_name: boolean | undefined;
    use_excluded_activity_urls: boolean;
    use_worker_url: boolean;
    compress_intake_requests: boolean | undefined;
    track_views_manually: boolean | undefined;
    track_user_interactions: boolean | undefined;
    track_resources: boolean | undefined;
    track_long_task: boolean | undefined;
    plugins: ({
        name: string;
    } & Record<string, unknown>)[] | undefined;
} & {
    session_sample_rate: number | undefined;
    telemetry_sample_rate: number | undefined;
    telemetry_configuration_sample_rate: number | undefined;
    telemetry_usage_sample_rate: number | undefined;
    use_before_send: boolean;
    use_cross_site_session_cookie: boolean | undefined;
    use_partitioned_cross_site_session_cookie: boolean | undefined;
    use_secure_session_cookie: boolean | undefined;
    use_proxy: boolean;
    silent_multiple_init: boolean | undefined;
    track_session_across_subdomains: boolean | undefined;
    allow_fallback_to_local_storage: boolean;
    store_contexts_across_pages: boolean;
    allow_untrusted_events: boolean;
    tracking_consent: import("@datadog/browser-core").TrackingConsent | undefined;
};
