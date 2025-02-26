import type { Duration, RelativeTime } from '@datadog/browser-core';
import type { RumConfiguration } from '../configuration';
import type { PageStateServerEntry } from '../../rawRumEvent.types';
export declare const MAX_PAGE_STATE_ENTRIES = 4000;
export declare const MAX_PAGE_STATE_ENTRIES_SELECTABLE = 500;
export declare const PAGE_STATE_CONTEXT_TIME_OUT_DELAY: number;
export declare const enum PageState {
    ACTIVE = "active",
    PASSIVE = "passive",
    HIDDEN = "hidden",
    FROZEN = "frozen",
    TERMINATED = "terminated"
}
export type PageStateEntry = {
    state: PageState;
    startTime: RelativeTime;
};
export interface PageStateHistory {
    findAll: (startTime: RelativeTime, duration: Duration) => PageStateServerEntry[] | undefined;
    wasInPageStateAt: (state: PageState, startTime: RelativeTime) => boolean;
    wasInPageStateDuringPeriod: (state: PageState, startTime: RelativeTime, duration: Duration) => boolean;
    addPageState(nextPageState: PageState, startTime?: RelativeTime): void;
    stop: () => void;
}
export declare function startPageStateHistory(configuration: RumConfiguration, maxPageStateEntriesSelectable?: number): PageStateHistory;
