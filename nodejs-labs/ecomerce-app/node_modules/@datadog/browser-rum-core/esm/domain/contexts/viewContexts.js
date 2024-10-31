import { SESSION_TIME_OUT_DELAY, ValueHistory } from '@datadog/browser-core';
export var VIEW_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
export function startViewContexts(lifeCycle) {
    var viewContextHistory = new ValueHistory(VIEW_CONTEXT_TIME_OUT_DELAY);
    lifeCycle.subscribe(2 /* LifeCycleEventType.BEFORE_VIEW_CREATED */, function (view) {
        viewContextHistory.add(buildViewContext(view), view.startClocks.relative);
    });
    lifeCycle.subscribe(6 /* LifeCycleEventType.AFTER_VIEW_ENDED */, function (_a) {
        var endClocks = _a.endClocks;
        viewContextHistory.closeActive(endClocks.relative);
    });
    lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, function () {
        viewContextHistory.reset();
    });
    function buildViewContext(view) {
        return {
            service: view.service,
            version: view.version,
            id: view.id,
            name: view.name,
            startClocks: view.startClocks,
        };
    }
    return {
        findView: function (startTime) { return viewContextHistory.find(startTime); },
        stop: function () {
            viewContextHistory.stop();
        },
    };
}
//# sourceMappingURL=viewContexts.js.map