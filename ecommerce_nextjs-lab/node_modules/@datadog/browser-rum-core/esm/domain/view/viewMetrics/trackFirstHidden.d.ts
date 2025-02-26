import type { RelativeTime } from '@datadog/browser-core';
import type { RumConfiguration } from '../../configuration';
export type FirstHidden = ReturnType<typeof trackFirstHidden>;
export declare function trackFirstHidden(configuration: RumConfiguration, eventTarget?: Window): {
    readonly timeStamp: RelativeTime;
    stop(): void;
};
