import type { RelativeTime, ContextValue, Context, CustomerDataTracker } from '@datadog/browser-core';
import type { LifeCycle } from '../lifeCycle';
export declare const FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY: number;
export declare const BYTES_COMPUTATION_THROTTLING_DELAY = 200;
export type FeatureFlagContext = Context;
export interface FeatureFlagContexts {
    findFeatureFlagEvaluations: (startTime?: RelativeTime) => FeatureFlagContext | undefined;
    addFeatureFlagEvaluation: (key: string, value: ContextValue) => void;
    stop: () => void;
}
/**
 * Start feature flag contexts
 *
 * Feature flag contexts follow the life of views.
 * A new context is added when a view is created and ended when the view is ended
 *
 * Note: we choose not to add a new context at each evaluation to save memory
 */
export declare function startFeatureFlagContexts(lifeCycle: LifeCycle, customerDataTracker: CustomerDataTracker): FeatureFlagContexts;
