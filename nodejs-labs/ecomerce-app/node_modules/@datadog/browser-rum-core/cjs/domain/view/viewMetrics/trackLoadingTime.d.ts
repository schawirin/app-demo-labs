import type { ClocksState, Duration, Observable } from '@datadog/browser-core';
import type { RumConfiguration } from '../../configuration';
import type { LifeCycle } from '../../lifeCycle';
import { ViewLoadingType } from '../../../rawRumEvent.types';
export declare function trackLoadingTime(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration, loadType: ViewLoadingType, viewStart: ClocksState, callback: (loadingTime: Duration) => void): {
    stop: () => void;
    setLoadEvent: (loadEvent: Duration) => void;
};
