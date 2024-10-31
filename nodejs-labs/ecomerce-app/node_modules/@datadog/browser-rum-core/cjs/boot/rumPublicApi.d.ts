import type { Context, User, DeflateWorker, DeflateEncoderStreamId, DeflateEncoder, TrackingConsent, PublicApi } from '@datadog/browser-core';
import type { LifeCycle } from '../domain/lifeCycle';
import type { ViewContexts } from '../domain/contexts/viewContexts';
import type { RumSessionManager } from '../domain/rumSessionManager';
import type { ReplayStats } from '../rawRumEvent.types';
import type { RumConfiguration, RumInitConfiguration } from '../domain/configuration';
import type { ViewOptions } from '../domain/view/trackViews';
import type { InternalContext } from '../domain/contexts/internalContext';
import type { StartRum, StartRumResult } from './startRum';
export interface StartRecordingOptions {
    force: boolean;
}
export interface RumPublicApi extends PublicApi {
    /**
     * Init the RUM browser SDK.
     * @param initConfiguration Configuration options of the SDK
     *
     * See [RUM Browser Monitoring Setup](https://docs.datadoghq.com/real_user_monitoring/browser) for further information.
     */
    init: (initConfiguration: RumInitConfiguration) => void;
    /**
     * Set the tracking consent of the current user.
     *
     * @param {"granted" | "not-granted"} trackingConsent The user tracking consent
     *
     * Data will be sent only if it is set to "granted". This value won't be stored by the library
     * across page loads: you will need to call this method or set the appropriate `trackingConsent`
     * field in the init() method at each page load.
     *
     * If this method is called before the init() method, the provided value will take precedence
     * over the one provided as initialization parameter.
     *
     * See [User tracking consent](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#user-tracking-consent) for further information.
     */
    setTrackingConsent: (trackingConsent: TrackingConsent) => void;
    /**
     * Set the global context information to all events, stored in `@context`
     *
     * @param context Global context
     *
     * See [Global context](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#global-context) for further information.
     */
    setGlobalContext: (context: any) => void;
    /**
     * Get the global Context
     *
     * See [Global context](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#global-context) for further information.
     */
    getGlobalContext: () => Context;
    /**
     * Set or update a global context property, stored in `@context.<key>`
     *
     * @param key Key of the property
     * @param property Value of the property
     *
     * See [Global context](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#global-context) for further information.
     */
    setGlobalContextProperty: (key: any, value: any) => void;
    /**
     * Remove a global context property
     *
     * See [Global context](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#global-context) for further information.
     */
    removeGlobalContextProperty: (key: any) => void;
    /**
     * Clear the global context
     *
     * See [Global context](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#global-context) for further information.
     */
    clearGlobalContext: () => void;
    /**
     * [Internal API] Get the internal SDK context
     */
    getInternalContext: (startTime?: number) => InternalContext | undefined;
    /**
     * Get the init configuration
     */
    getInitConfiguration: () => RumInitConfiguration | undefined;
    /**
     * Add a custom action, stored in `@action`
     * @param name Name of the action
     * @param context Context of the action
     *
     * See [Send RUM Custom Actions](https://docs.datadoghq.com/real_user_monitoring/guide/send-rum-custom-actions) for further information.
     */
    addAction: (name: string, context?: object) => void;
    /**
     * Add a custom error, stored in `@error`.
     * @param error Error. Favor sending a [Javascript Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) to have a stack trace attached to the error event.
     * @param context Context of the error
     *
     * See [Send RUM Custom Actions](https://docs.datadoghq.com/real_user_monitoring/guide/send-rum-custom-actions) for further information.
     */
    addError: (error: unknown, context?: object) => void;
    /**
     * Add a custom timing relative to the start of the current view,
     * stored in `@view.custom_timings.<timing_name>`
     *
     * @param name Name of the custom timing
     * @param [time] Epoch timestamp of the custom timing (if not set, will use current time)
     *
     * Note: passing a relative time is discouraged since it is actually used as-is but displayed relative to the view start.
     * We currently don't provide a way to retrieve the view start time, so it can be challenging to provide a timing relative to the view start.
     * see https://github.com/DataDog/browser-sdk/issues/2552
     */
    addTiming: (name: string, time?: number) => void;
    /**
     * Set user information to all events, stored in `@usr`
     *
     * See [User session](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#user-session) for further information.
     */
    setUser: (newUser: User) => void;
    /**
     * Get user information
     *
     * See [User session](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#user-session) for further information.
     */
    getUser: () => Context;
    /**
     * Set or update the user property, stored in `@usr.<key>`
     *
     * @param key Key of the property
     * @param property Value of the property
     *
     * See [User session](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#user-session) for further information.
     */
    setUserProperty: (key: any, property: any) => void;
    /**
     * Remove a user property
     *
     * See [User session](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#user-session) for further information.
     */
    removeUserProperty: (key: any) => void;
    /**
     * Clear all user information
     *
     * See [User session](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#user-session) for further information.
     */
    clearUser: () => void;
    /**
     * Start a view manually.
     * Enable to manual start a view, use `trackViewManually: true` init parameter and call `startView()` to create RUM views and be aligned with how you’ve defined them in your SPA application routing.
     *
     * @param options.name name of the view
     * @param options.service service of the view
     * @param options.version version of the view
     *
     * See [Override default RUM view names](https://docs.datadoghq.com/real_user_monitoring/browser/advanced_configuration/#override-default-rum-view-names) for further information.
     */
    startView: {
        (name?: string): void;
        (options: ViewOptions): void;
    };
    /**
     * Stop the session. A new session will start at the next user interaction with the page.
     */
    stopSession: () => void;
    /**
     * Add a feature flag evaluation,
     * stored in `@feature_flags.<feature_flag_key>`
     *
     * @param {string} key The key of the feature flag.
     * @param {any} value The value of the feature flag.
     *
     * We recommend enabling the intake request compression when using feature flags `compressIntakeRequests: true`.
     *
     * See [Feature Flag Tracking](https://docs.datadoghq.com/real_user_monitoring/feature_flag_tracking/) for further information.
     */
    addFeatureFlagEvaluation: (key: string, value: any) => void;
    /**
     * Get the Session Replay Link.
     *
     * See [Connect Session Replay To Your Third-Party Tools](https://docs.datadoghq.com/real_user_monitoring/guide/connect-session-replay-to-your-third-party-tools) for further information.
     */
    getSessionReplayLink: () => string | undefined;
    /**
     * Start Session Replay recording.
     * Enable to conditionally start the recording, use the `startSessionReplayRecordingManually:true` init parameter and call `startSessionReplayRecording()`
     *
     * See [Browser Session Replay](https://docs.datadoghq.com/real_user_monitoring/session_replay/browser) for further information.
     */
    startSessionReplayRecording: (options?: StartRecordingOptions) => void;
    /**
     * Stop Session Replay recording.
     *
     * See [Browser Session Replay](https://docs.datadoghq.com/real_user_monitoring/session_replay/browser) for further information.
     */
    stopSessionReplayRecording: () => void;
}
export interface RecorderApi {
    start: (options?: StartRecordingOptions) => void;
    stop: () => void;
    onRumStart: (lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, viewContexts: ViewContexts, deflateWorker: DeflateWorker | undefined) => void;
    isRecording: () => boolean;
    getReplayStats: (viewId: string) => ReplayStats | undefined;
    getSessionReplayLink: () => string | undefined;
}
export interface RumPublicApiOptions {
    ignoreInitIfSyntheticsWillInjectRum?: boolean;
    startDeflateWorker?: (configuration: RumConfiguration, source: string, onInitializationFailure: () => void) => DeflateWorker | undefined;
    createDeflateEncoder?: (configuration: RumConfiguration, worker: DeflateWorker, streamId: DeflateEncoderStreamId) => DeflateEncoder;
}
export interface Strategy {
    init: (initConfiguration: RumInitConfiguration, publicApi: RumPublicApi) => void;
    initConfiguration: RumInitConfiguration | undefined;
    getInternalContext: StartRumResult['getInternalContext'];
    stopSession: StartRumResult['stopSession'];
    addTiming: StartRumResult['addTiming'];
    startView: StartRumResult['startView'];
    addAction: StartRumResult['addAction'];
    addError: StartRumResult['addError'];
    addFeatureFlagEvaluation: StartRumResult['addFeatureFlagEvaluation'];
    startDurationVital: StartRumResult['startDurationVital'];
    stopDurationVital: StartRumResult['stopDurationVital'];
}
export declare function makeRumPublicApi(startRumImpl: StartRum, recorderApi: RecorderApi, options?: RumPublicApiOptions): RumPublicApi;
