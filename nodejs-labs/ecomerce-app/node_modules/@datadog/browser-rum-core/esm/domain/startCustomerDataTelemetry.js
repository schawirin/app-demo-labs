import { includes, performDraw, ONE_SECOND, addTelemetryDebug, setInterval, } from '@datadog/browser-core';
export var MEASURES_PERIOD_DURATION = 10 * ONE_SECOND;
var currentPeriodMeasures;
var currentBatchMeasures;
var batchHasRumEvent;
export function startCustomerDataTelemetry(configuration, telemetry, lifeCycle, customerDataTrackerManager, batchFlushObservable) {
    var customerDataTelemetryEnabled = telemetry.enabled && performDraw(configuration.customerDataTelemetrySampleRate);
    if (!customerDataTelemetryEnabled) {
        return;
    }
    initCurrentPeriodMeasures();
    initCurrentBatchMeasures();
    // We measure the data of every view updates even if there could only be one per batch due to the upsert
    // It means that contexts bytes count sums can be higher than it really is
    lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, function (event) {
        batchHasRumEvent = true;
        updateMeasure(currentBatchMeasures.globalContextBytes, customerDataTrackerManager.getOrCreateTracker(2 /* CustomerDataType.GlobalContext */).getBytesCount());
        updateMeasure(currentBatchMeasures.userContextBytes, customerDataTrackerManager.getOrCreateTracker(1 /* CustomerDataType.User */).getBytesCount());
        updateMeasure(currentBatchMeasures.featureFlagBytes, includes(["view" /* RumEventType.VIEW */, "error" /* RumEventType.ERROR */], event.type)
            ? customerDataTrackerManager.getOrCreateTracker(0 /* CustomerDataType.FeatureFlag */).getBytesCount()
            : 0);
    });
    batchFlushObservable.subscribe(function (_a) {
        var bytesCount = _a.bytesCount, messagesCount = _a.messagesCount;
        // Don't measure batch that only contains telemetry events to avoid batch sending loop
        // It could happen because after each batch we are adding a customer data measures telemetry event to the next one
        if (!batchHasRumEvent) {
            return;
        }
        currentPeriodMeasures.batchCount += 1;
        updateMeasure(currentPeriodMeasures.batchBytesCount, bytesCount);
        updateMeasure(currentPeriodMeasures.batchMessagesCount, messagesCount);
        mergeMeasure(currentPeriodMeasures.globalContextBytes, currentBatchMeasures.globalContextBytes);
        mergeMeasure(currentPeriodMeasures.userContextBytes, currentBatchMeasures.userContextBytes);
        mergeMeasure(currentPeriodMeasures.featureFlagBytes, currentBatchMeasures.featureFlagBytes);
        initCurrentBatchMeasures();
    });
    setInterval(sendCurrentPeriodMeasures, MEASURES_PERIOD_DURATION);
}
function sendCurrentPeriodMeasures() {
    if (currentPeriodMeasures.batchCount === 0) {
        return;
    }
    addTelemetryDebug('Customer data measures', currentPeriodMeasures);
    initCurrentPeriodMeasures();
}
function createMeasure() {
    return { min: Infinity, max: 0, sum: 0 };
}
function updateMeasure(measure, value) {
    measure.sum += value;
    measure.min = Math.min(measure.min, value);
    measure.max = Math.max(measure.max, value);
}
function mergeMeasure(target, source) {
    target.sum += source.sum;
    target.min = Math.min(target.min, source.min);
    target.max = Math.max(target.max, source.max);
}
function initCurrentPeriodMeasures() {
    currentPeriodMeasures = {
        batchCount: 0,
        batchBytesCount: createMeasure(),
        batchMessagesCount: createMeasure(),
        globalContextBytes: createMeasure(),
        userContextBytes: createMeasure(),
        featureFlagBytes: createMeasure(),
    };
}
function initCurrentBatchMeasures() {
    batchHasRumEvent = false;
    currentBatchMeasures = {
        globalContextBytes: createMeasure(),
        userContextBytes: createMeasure(),
        featureFlagBytes: createMeasure(),
    };
}
//# sourceMappingURL=startCustomerDataTelemetry.js.map