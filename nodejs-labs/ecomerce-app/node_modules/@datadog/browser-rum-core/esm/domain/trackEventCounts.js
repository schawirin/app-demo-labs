import { noop } from '@datadog/browser-core';
export function trackEventCounts(_a) {
    var lifeCycle = _a.lifeCycle, isChildEvent = _a.isChildEvent, _b = _a.onChange, callback = _b === void 0 ? noop : _b;
    var eventCounts = {
        errorCount: 0,
        longTaskCount: 0,
        resourceCount: 0,
        actionCount: 0,
        frustrationCount: 0,
    };
    var subscription = lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, function (event) {
        var _a;
        if (event.type === 'view' || event.type === 'vital' || !isChildEvent(event)) {
            return;
        }
        switch (event.type) {
            case "error" /* RumEventType.ERROR */:
                eventCounts.errorCount += 1;
                callback();
                break;
            case "action" /* RumEventType.ACTION */:
                eventCounts.actionCount += 1;
                if (event.action.frustration) {
                    eventCounts.frustrationCount += event.action.frustration.type.length;
                }
                callback();
                break;
            case "long_task" /* RumEventType.LONG_TASK */:
                eventCounts.longTaskCount += 1;
                callback();
                break;
            case "resource" /* RumEventType.RESOURCE */:
                if (!((_a = event._dd) === null || _a === void 0 ? void 0 : _a.discarded)) {
                    eventCounts.resourceCount += 1;
                    callback();
                }
                break;
        }
    });
    return {
        stop: function () {
            subscription.unsubscribe();
        },
        eventCounts: eventCounts,
    };
}
//# sourceMappingURL=trackEventCounts.js.map