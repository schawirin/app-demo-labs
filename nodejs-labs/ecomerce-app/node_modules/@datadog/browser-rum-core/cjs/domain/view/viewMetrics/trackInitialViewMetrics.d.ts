import type { Duration } from '@datadog/browser-core';
import type { RumConfiguration } from '../../configuration';
import type { LifeCycle } from '../../lifeCycle';
import type { FirstInput } from './trackFirstInput';
import type { NavigationTimings } from './trackNavigationTimings';
import type { LargestContentfulPaint } from './trackLargestContentfulPaint';
export interface InitialViewMetrics {
    firstContentfulPaint?: Duration;
    navigationTimings?: NavigationTimings;
    largestContentfulPaint?: LargestContentfulPaint;
    firstInput?: FirstInput;
}
export declare function trackInitialViewMetrics(lifeCycle: LifeCycle, configuration: RumConfiguration, setLoadEvent: (loadEnd: Duration) => void, scheduleViewUpdate: () => void): {
    stop: () => void;
    initialViewMetrics: InitialViewMetrics;
};
