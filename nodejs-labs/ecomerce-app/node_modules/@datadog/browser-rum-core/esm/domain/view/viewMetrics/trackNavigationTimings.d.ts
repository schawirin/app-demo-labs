import type { Duration } from '@datadog/browser-core';
import type { LifeCycle } from '../../lifeCycle';
export interface NavigationTimings {
    domComplete: Duration;
    domContentLoaded: Duration;
    domInteractive: Duration;
    loadEvent: Duration;
    firstByte: Duration | undefined;
}
export declare function trackNavigationTimings(lifeCycle: LifeCycle, callback: (timings: NavigationTimings) => void): {
    stop: () => void;
};
