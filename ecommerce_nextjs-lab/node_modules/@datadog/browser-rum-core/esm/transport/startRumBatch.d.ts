import type { Context, TelemetryEvent, Observable, RawError, PageExitEvent, Encoder } from '@datadog/browser-core';
import { DeflateEncoderStreamId } from '@datadog/browser-core';
import type { RumConfiguration } from '../domain/configuration';
import type { LifeCycle } from '../domain/lifeCycle';
export declare function startRumBatch(configuration: RumConfiguration, lifeCycle: LifeCycle, telemetryEventObservable: Observable<TelemetryEvent & Context>, reportError: (error: RawError) => void, pageExitObservable: Observable<PageExitEvent>, sessionExpireObservable: Observable<void>, createEncoder: (streamId: DeflateEncoderStreamId) => Encoder): {
    flushObservable: Observable<import("@datadog/browser-core").FlushEvent>;
    add(message: Context, replicated?: boolean): void;
    upsert: (message: Context, key: string) => void;
    stop: () => void;
};
