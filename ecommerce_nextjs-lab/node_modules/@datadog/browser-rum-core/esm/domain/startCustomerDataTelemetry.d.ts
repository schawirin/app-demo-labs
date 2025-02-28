import type { CustomerDataTrackerManager, FlushEvent, Observable, Telemetry } from '@datadog/browser-core';
import type { RumConfiguration } from './configuration';
import type { LifeCycle } from './lifeCycle';
export declare const MEASURES_PERIOD_DURATION: number;
export declare function startCustomerDataTelemetry(configuration: RumConfiguration, telemetry: Telemetry, lifeCycle: LifeCycle, customerDataTrackerManager: CustomerDataTrackerManager, batchFlushObservable: Observable<FlushEvent>): void;
