import { SESSION_TIME_OUT_DELAY, ValueHistory } from '@datadog/browser-core';
export var FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY = SESSION_TIME_OUT_DELAY;
export var BYTES_COMPUTATION_THROTTLING_DELAY = 200;
/**
 * Start feature flag contexts
 *
 * Feature flag contexts follow the life of views.
 * A new context is added when a view is created and ended when the view is ended
 *
 * Note: we choose not to add a new context at each evaluation to save memory
 */
export function startFeatureFlagContexts(lifeCycle, customerDataTracker) {
    var featureFlagContexts = new ValueHistory(FEATURE_FLAG_CONTEXT_TIME_OUT_DELAY);
    lifeCycle.subscribe(2 /* LifeCycleEventType.BEFORE_VIEW_CREATED */, function (_a) {
        var startClocks = _a.startClocks;
        featureFlagContexts.add({}, startClocks.relative);
        customerDataTracker.resetCustomerData();
    });
    lifeCycle.subscribe(6 /* LifeCycleEventType.AFTER_VIEW_ENDED */, function (_a) {
        var endClocks = _a.endClocks;
        featureFlagContexts.closeActive(endClocks.relative);
    });
    return {
        findFeatureFlagEvaluations: function (startTime) { return featureFlagContexts.find(startTime); },
        addFeatureFlagEvaluation: function (key, value) {
            var currentContext = featureFlagContexts.find();
            if (currentContext) {
                currentContext[key] = value;
                customerDataTracker.updateCustomerData(currentContext);
            }
        },
        stop: function () { return customerDataTracker.stop(); },
    };
}
//# sourceMappingURL=featureFlagContext.js.map