"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRecording = startRecording;
var browser_core_1 = require("@datadog/browser-core");
var record_1 = require("../domain/record");
var segmentCollection_1 = require("../domain/segmentCollection");
var startRecordBridge_1 = require("../domain/startRecordBridge");
function startRecording(lifeCycle, configuration, sessionManager, viewContexts, encoder, httpRequest) {
    var cleanupTasks = [];
    var reportError = function (error) {
        lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error: error });
        (0, browser_core_1.addTelemetryDebug)('Error reported to customer', { 'error.message': error.message });
    };
    var replayRequest = httpRequest ||
        (0, browser_core_1.createHttpRequest)(configuration, configuration.sessionReplayEndpointBuilder, segmentCollection_1.SEGMENT_BYTES_LIMIT, reportError);
    var addRecord;
    if (!(0, browser_core_1.canUseEventBridge)()) {
        var segmentCollection = (0, segmentCollection_1.startSegmentCollection)(lifeCycle, configuration, sessionManager, viewContexts, replayRequest, encoder);
        addRecord = segmentCollection.addRecord;
        cleanupTasks.push(segmentCollection.stop);
    }
    else {
        ;
        (addRecord = (0, startRecordBridge_1.startRecordBridge)(viewContexts).addRecord);
    }
    var stopRecording = (0, record_1.record)({
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