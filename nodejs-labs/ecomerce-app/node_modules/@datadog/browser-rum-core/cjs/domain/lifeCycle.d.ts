import type { Context, PageExitEvent, RawError, RelativeTime } from '@datadog/browser-core';
import { AbstractLifeCycle } from '@datadog/browser-core';
import type { RumPerformanceEntry } from '../browser/performanceCollection';
import type { RumEventDomainContext } from '../domainContext.types';
import type { RawRumEvent } from '../rawRumEvent.types';
import type { RumEvent } from '../rumEvent.types';
import type { CommonContext } from './contexts/commonContext';
import type { RequestCompleteEvent, RequestStartEvent } from './requestCollection';
import type { AutoAction } from './action/actionCollection';
import type { ViewEvent, ViewCreatedEvent, ViewEndedEvent } from './view/trackViews';
export declare const enum LifeCycleEventType {
    PERFORMANCE_ENTRIES_COLLECTED = 0,
    AUTO_ACTION_COMPLETED = 1,
    BEFORE_VIEW_CREATED = 2,
    VIEW_CREATED = 3,
    VIEW_UPDATED = 4,
    VIEW_ENDED = 5,
    AFTER_VIEW_ENDED = 6,
    REQUEST_STARTED = 7,
    REQUEST_COMPLETED = 8,
    SESSION_EXPIRED = 9,
    SESSION_RENEWED = 10,
    PAGE_EXITED = 11,
    RAW_RUM_EVENT_COLLECTED = 12,
    RUM_EVENT_COLLECTED = 13,
    RAW_ERROR_COLLECTED = 14
}
declare const LifeCycleEventTypeAsConst: {
    PERFORMANCE_ENTRIES_COLLECTED: LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED;
    AUTO_ACTION_COMPLETED: LifeCycleEventType.AUTO_ACTION_COMPLETED;
    BEFORE_VIEW_CREATED: LifeCycleEventType.BEFORE_VIEW_CREATED;
    VIEW_CREATED: LifeCycleEventType.VIEW_CREATED;
    VIEW_UPDATED: LifeCycleEventType.VIEW_UPDATED;
    VIEW_ENDED: LifeCycleEventType.VIEW_ENDED;
    AFTER_VIEW_ENDED: LifeCycleEventType.AFTER_VIEW_ENDED;
    REQUEST_STARTED: LifeCycleEventType.REQUEST_STARTED;
    REQUEST_COMPLETED: LifeCycleEventType.REQUEST_COMPLETED;
    SESSION_EXPIRED: LifeCycleEventType.SESSION_EXPIRED;
    SESSION_RENEWED: LifeCycleEventType.SESSION_RENEWED;
    PAGE_EXITED: LifeCycleEventType.PAGE_EXITED;
    RAW_RUM_EVENT_COLLECTED: LifeCycleEventType.RAW_RUM_EVENT_COLLECTED;
    RUM_EVENT_COLLECTED: LifeCycleEventType.RUM_EVENT_COLLECTED;
    RAW_ERROR_COLLECTED: LifeCycleEventType.RAW_ERROR_COLLECTED;
};
export interface LifeCycleEventMap {
    [LifeCycleEventTypeAsConst.PERFORMANCE_ENTRIES_COLLECTED]: RumPerformanceEntry[];
    [LifeCycleEventTypeAsConst.AUTO_ACTION_COMPLETED]: AutoAction;
    [LifeCycleEventTypeAsConst.BEFORE_VIEW_CREATED]: ViewCreatedEvent;
    [LifeCycleEventTypeAsConst.VIEW_CREATED]: ViewCreatedEvent;
    [LifeCycleEventTypeAsConst.VIEW_UPDATED]: ViewEvent;
    [LifeCycleEventTypeAsConst.VIEW_ENDED]: ViewEndedEvent;
    [LifeCycleEventTypeAsConst.AFTER_VIEW_ENDED]: ViewEndedEvent;
    [LifeCycleEventTypeAsConst.REQUEST_STARTED]: RequestStartEvent;
    [LifeCycleEventTypeAsConst.REQUEST_COMPLETED]: RequestCompleteEvent;
    [LifeCycleEventTypeAsConst.SESSION_EXPIRED]: void;
    [LifeCycleEventTypeAsConst.SESSION_RENEWED]: void;
    [LifeCycleEventTypeAsConst.PAGE_EXITED]: PageExitEvent;
    [LifeCycleEventTypeAsConst.RAW_RUM_EVENT_COLLECTED]: RawRumEventCollectedData;
    [LifeCycleEventTypeAsConst.RUM_EVENT_COLLECTED]: RumEvent & Context;
    [LifeCycleEventTypeAsConst.RAW_ERROR_COLLECTED]: {
        error: RawError;
        savedCommonContext?: CommonContext;
        customerContext?: Context;
    };
}
export interface RawRumEventCollectedData<E extends RawRumEvent = RawRumEvent> {
    startTime: RelativeTime;
    savedCommonContext?: CommonContext;
    customerContext?: Context;
    rawRumEvent: E;
    domainContext: RumEventDomainContext<E['type']>;
}
export declare const LifeCycle: {
    new (): AbstractLifeCycle<LifeCycleEventMap>;
};
export type LifeCycle = AbstractLifeCycle<LifeCycleEventMap>;
export {};
