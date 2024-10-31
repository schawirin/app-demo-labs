import type { Observable } from '@datadog/browser-core';
import type { RecorderApi } from '../../boot/rumPublicApi';
import type { LifeCycle } from '../lifeCycle';
import type { LocationChange } from '../../browser/locationChangeObservable';
import type { RumConfiguration } from '../configuration';
import type { FeatureFlagContexts } from '../contexts/featureFlagContext';
import type { PageStateHistory } from '../contexts/pageStateHistory';
import type { ViewOptions } from './trackViews';
export declare function startViewCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, location: Location, domMutationObservable: Observable<void>, locationChangeObservable: Observable<LocationChange>, featureFlagContexts: FeatureFlagContexts, pageStateHistory: PageStateHistory, recorderApi: RecorderApi, initialViewOptions?: ViewOptions): {
    addTiming: (name: string, time?: import("@datadog/browser-core").RelativeTime | import("@datadog/browser-core").TimeStamp) => void;
    startView: (options?: ViewOptions, startClocks?: import("@datadog/browser-core").ClocksState) => void;
    stop: () => void;
};
