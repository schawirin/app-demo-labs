import type { RelativeTime } from '@datadog/browser-core';
import type { LifeCycle } from '../../lifeCycle';
import type { FirstHidden } from './trackFirstHidden';
export declare const FCP_MAXIMUM_DELAY: number;
export declare function trackFirstContentfulPaint(lifeCycle: LifeCycle, firstHidden: FirstHidden, callback: (fcpTiming: RelativeTime) => void): {
    stop: () => void;
};
