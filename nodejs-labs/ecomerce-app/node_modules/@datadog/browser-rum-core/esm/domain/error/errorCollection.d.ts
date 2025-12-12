import type { Context, ClocksState } from '@datadog/browser-core';
import type { RumConfiguration } from '../configuration';
import type { LifeCycle } from '../lifeCycle';
import type { FeatureFlagContexts } from '../contexts/featureFlagContext';
import type { CommonContext } from '../contexts/commonContext';
import type { PageStateHistory } from '../contexts/pageStateHistory';
export interface ProvidedError {
    startClocks: ClocksState;
    error: unknown;
    context?: Context;
    handlingStack: string;
}
export declare function startErrorCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, pageStateHistory: PageStateHistory, featureFlagContexts: FeatureFlagContexts): {
    addError: ({ error, handlingStack, startClocks, context: customerContext }: ProvidedError, savedCommonContext?: CommonContext) => void;
};
export declare function doStartErrorCollection(lifeCycle: LifeCycle, pageStateHistory: PageStateHistory, featureFlagContexts: FeatureFlagContexts): {
    addError: ({ error, handlingStack, startClocks, context: customerContext }: ProvidedError, savedCommonContext?: CommonContext) => void;
};
