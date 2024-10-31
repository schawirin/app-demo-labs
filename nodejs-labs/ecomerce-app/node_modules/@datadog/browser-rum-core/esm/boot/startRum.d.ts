import type { Observable, RawError, DeflateEncoderStreamId, Encoder, CustomerDataTrackerManager, TrackingConsentState } from '@datadog/browser-core';
import { LifeCycle } from '../domain/lifeCycle';
import type { RumSessionManager } from '../domain/rumSessionManager';
import type { LocationChange } from '../browser/locationChangeObservable';
import type { RumConfiguration } from '../domain/configuration';
import type { ViewOptions } from '../domain/view/trackViews';
import type { CommonContext } from '../domain/contexts/commonContext';
import type { RecorderApi } from './rumPublicApi';
export type StartRum = typeof startRum;
export type StartRumResult = ReturnType<StartRum>;
export declare function startRum(configuration: RumConfiguration, recorderApi: RecorderApi, customerDataTrackerManager: CustomerDataTrackerManager, getCommonContext: () => CommonContext, initialViewOptions: ViewOptions | undefined, createEncoder: (streamId: DeflateEncoderStreamId) => Encoder, trackingConsentState: TrackingConsentState): {
    addAction: (action: import("../domain/action/actionCollection").CustomAction, savedCommonContext?: CommonContext) => void;
    addError: ({ error, handlingStack, startClocks, context: customerContext }: import("../domain/error/errorCollection").ProvidedError, savedCommonContext?: CommonContext) => void;
    addTiming: (name: string, time?: import("@datadog/browser-core").RelativeTime | import("@datadog/browser-core").TimeStamp) => void;
    addFeatureFlagEvaluation: (key: string, value: import("@datadog/browser-core").ContextValue) => void;
    startView: (options?: ViewOptions, startClocks?: import("@datadog/browser-core").ClocksState) => void;
    lifeCycle: import("@datadog/browser-core").AbstractLifeCycle<import("../domain/lifeCycle").LifeCycleEventMap>;
    viewContexts: import("../domain/contexts/viewContexts").ViewContexts;
    session: RumSessionManager;
    stopSession: () => void;
    getInternalContext: (startTime?: number) => import("../domain/contexts/internalContext").InternalContext | undefined;
    startDurationVital: (vitalStart: import("../domain/vital/vitalCollection").DurationVitalStart) => void;
    stopDurationVital: (vitalStop: import("../domain/vital/vitalCollection").DurationVitalStop) => void;
    stop: () => void;
};
export declare function startRumEventCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, location: Location, sessionManager: RumSessionManager, locationChangeObservable: Observable<LocationChange>, domMutationObservable: Observable<void>, getCommonContext: () => CommonContext, reportError: (error: RawError) => void): {
    viewContexts: import("../domain/contexts/viewContexts").ViewContexts;
    pageStateHistory: import("../domain/contexts/pageStateHistory").PageStateHistory;
    urlContexts: {
        findUrl: (startTime?: import("@datadog/browser-core").RelativeTime) => import("../domain/contexts/urlContexts").UrlContext | undefined;
        stop: () => void;
    };
    addAction: (action: import("../domain/action/actionCollection").CustomAction, savedCommonContext?: CommonContext) => void;
    actionContexts: import("../domain/action/trackClickActions").ActionContexts;
    stop: () => void;
};
