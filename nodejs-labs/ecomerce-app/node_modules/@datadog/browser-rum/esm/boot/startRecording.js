import { createHttpRequest, addTelemetryDebug, canUseEventBridge } from '@datadog/browser-core';
import { record } from '../domain/record';
import { startSegmentCollection, SEGMENT_BYTES_LIMIT } from '../domain/segmentCollection';
import { startRecordBridge } from '../domain/startRecordBridge';
export function startRecording(lifeCycle, configuration, sessionManager, viewContexts, encoder, httpRequest) {
    var cleanupTasks = [];
    var reportError = function (error) {
        lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error: error });
        addTelemetryDebug('Error reported to customer', { 'error.message': error.message });
    };
    var replayRequest = httpRequest ||
        createHttpRequest(configuration, configuration.sessionReplayEndpointBuilder, SEGMENT_BYTES_LIMIT, reportError);
    var addRecord;
    if (!canUseEventBridge()) {
        var segmentCollection = startSegmentCollection(lifeCycle, configuration, sessionManager, viewContexts, replayRequest, encoder);
        addRecord = segmentCollection.addRecord;
        cleanupTasks.push(segmentCollection.stop);
    }
    else {
        ;
        (addRecord = startRecordBridge(viewContexts).addRecord);
    }
    var stopRecording = record({
        emit: addRecord,
        configuration: configuration,
        lifeCycle: lifeCycle,
        viewContexts: viewContexts,
    }).stop;
    cleanupTasks.push(stopRecording);
    return {
        stop: function () {
            cleanupTasks.forEach(function (task) { return task(); });
        },
    };
}
//# sourceMappingURL=startRecording.js.map