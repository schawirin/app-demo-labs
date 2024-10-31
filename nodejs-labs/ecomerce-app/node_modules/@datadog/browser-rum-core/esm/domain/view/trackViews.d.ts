import type { Duration, ClocksState, TimeStamp, RelativeTime } from '@datadog/browser-core';
import { Observable } from '@datadog/browser-core';
import type { ViewCustomTimings } from '../../rawRumEvent.types';
import { ViewLoadingType } from '../../rawRumEvent.types';
import type { LifeCycle } from '../lifeCycle';
import type { EventCounts } from '../trackEventCounts';
import type { LocationChange } from '../../browser/locationChangeObservable';
import type { RumConfiguration, RumInitConfiguration } from '../configuration';
import type { InitialViewMetrics } from './viewMetrics/trackInitialViewMetrics';
import type { CommonViewMetrics } from './viewMetrics/trackCommonViewMetrics';
export interface ViewEvent {
    id: string;
    name?: string;
    service?: string;
    version?: string;
    location: Readonly<Location>;
    commonViewMetrics: CommonViewMetrics;
    initialViewMetrics: InitialViewMetrics;
    customTimings: ViewCustomTimings;
    eventCounts: EventCounts;
    documentVersion: number;
    startClocks: ClocksState;
    duration: Duration;
    isActive: boolean;
    sessionIsActive: boolean;
    loadingType: ViewLoadingType;
}
export interface ViewCreatedEvent {
    id: string;
    name?: string;
    service?: string;
    version?: string;
    startClocks: ClocksState;
}
export interface ViewEndedEvent {
    endClocks: ClocksState;
}
export declare const THROTTLE_VIEW_UPDATE_PERIOD = 3000;
export declare const SESSION_KEEP_ALIVE_INTERVAL: number;
export declare const KEEP_TRACKING_AFTER_VIEW_DELAY: number;
export interface ViewOptions {
    name?: string;
    service?: RumInitConfiguration['service'];
    version?: RumInitConfiguration['version'];
}
export declare function trackViews(location: Location, lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration, locationChangeObservable: Observable<LocationChange>, areViewsTrackedAutomatically: boolean, initialViewOptions?: ViewOptions): {
    addTiming: (name: string, time?: RelativeTime | TimeStamp) => void;
    startView: (options?: ViewOptions, startClocks?: ClocksState) => void;
    stop: () => void;
};
