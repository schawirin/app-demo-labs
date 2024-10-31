import { noop, assign, combine, toServerDuration, generateUUID } from '@datadog/browser-core';
import { discardNegativeDuration } from '../discardNegativeDuration';
import { trackClickActions } from './trackClickActions';
export function startActionCollection(lifeCycle, domMutationObservable, configuration, pageStateHistory) {
    lifeCycle.subscribe(1 /* LifeCycleEventType.AUTO_ACTION_COMPLETED */, function (action) {
        return lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processAction(action, pageStateHistory));
    });
    var actionContexts = { findActionId: noop };
    if (configuration.trackUserInteractions) {
        actionContexts = trackClickActions(lifeCycle, domMutationObservable, configuration).actionContexts;
    }
    return {
        addAction: function (action, savedCommonContext) {
            lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, assign({
                savedCommonContext: savedCommonContext,
            }, processAction(action, pageStateHistory)));
        },
        actionContexts: actionContexts,
    };
}
function processAction(action, pageStateHistory) {
    var autoActionProperties = isAutoAction(action)
        ? {
            action: {
                id: action.id,
                loading_time: discardNegativeDuration(toServerDuration(action.duration)),
                frustration: {
                    type: action.frustrationTypes,
                },
                error: {
                    count: action.counts.errorCount,
                },
                long_task: {
                    count: action.counts.longTaskCount,
                },
                resource: {
                    count: action.counts.resourceCount,
                },
            },
            _dd: {
                action: {
                    target: action.target,
                    position: action.position,
                },
            },
        }
        : undefined;
    var customerContext = !isAutoAction(action) ? action.context : undefined;
    var actionEvent = combine({
        action: {
            id: generateUUID(),
            target: {
                name: action.name,
            },
            type: action.type,
        },
        date: action.startClocks.timeStamp,
        type: "action" /* RumEventType.ACTION */,
        view: { in_foreground: pageStateHistory.wasInPageStateAt("active" /* PageState.ACTIVE */, action.startClocks.relative) },
    }, autoActionProperties);
    var domainContext = isAutoAction(action) ? { events: action.events } : {};
    if (!isAutoAction(action) && action.handlingStack) {
        domainContext.handlingStack = action.handlingStack;
    }
    return {
        customerContext: customerContext,
        rawRumEvent: actionEvent,
        startTime: action.startClocks.relative,
        domainContext: domainContext,
    };
}
function isAutoAction(action) {
    return action.type !== "custom" /* ActionType.CUSTOM */;
}
//# sourceMappingURL=actionCollection.js.map