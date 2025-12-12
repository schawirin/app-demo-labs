import type { ClocksState, Context } from '@datadog/browser-core';
import type { LifeCycle } from '../lifeCycle';
import type { PageStateHistory } from '../contexts/pageStateHistory';
export interface DurationVitalStart {
    name: string;
    startClocks: ClocksState;
    context?: Context;
}
export interface DurationVitalStop {
    name: string;
    stopClocks: ClocksState;
    context?: Context;
}
export declare function startVitalCollection(lifeCycle: LifeCycle, pageStateHistory: PageStateHistory): {
    startDurationVital: (vitalStart: DurationVitalStart) => void;
    stopDurationVital: (vitalStop: DurationVitalStop) => void;
};
