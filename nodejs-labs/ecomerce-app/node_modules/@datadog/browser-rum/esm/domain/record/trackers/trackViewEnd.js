import { timeStampNow } from '@datadog/browser-core';
import { RecordType } from '../../../types';
export function trackViewEnd(lifeCycle, viewEndCb) {
    var viewEndSubscription = lifeCycle.subscribe(5 /* LifeCycleEventType.VIEW_ENDED */, function () {
        viewEndCb({
            timestamp: timeStampNow(),
            type: RecordType.ViewEnd,
        });
    });
    return {
        stop: function () {
            viewEndSubscription.unsubscribe();
        },
    };
}
//# sourceMappingURL=trackViewEnd.js.map