import type { ClocksState, Context, Observable } from '@datadog/browser-core';
import { ActionType } from '../../rawRumEvent.types';
import type { LifeCycle } from '../lifeCycle';
import type { RumConfiguration } from '../configuration';
import type { CommonContext } from '../contexts/commonContext';
import type { PageStateHistory } from '../contexts/pageStateHistory';
import type { ActionContexts, ClickAction } from './trackClickActions';
export type { ActionContexts };
export interface CustomAction {
    type: ActionType.CUSTOM;
    name: string;
    startClocks: ClocksState;
    context?: Context;
    handlingStack?: string;
}
export type AutoAction = ClickAction;
export declare function startActionCollection(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration, pageStateHistory: PageStateHistory): {
    addAction: (action: CustomAction, savedCommonContext?: CommonContext) => void;
    actionContexts: ActionContexts;
};
