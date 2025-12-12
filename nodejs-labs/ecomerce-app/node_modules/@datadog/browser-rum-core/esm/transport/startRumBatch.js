import { combine, isTelemetryReplicationAllowed, startBatchWithReplica, } from '@datadog/browser-core';
export function startRumBatch(configuration, lifeCycle, telemetryEventObservable, reportError, pageExitObservable, sessionExpireObservable, createEncoder) {
    var replica = configuration.replica;
    var batch = startBatchWithReplica(configuration, {
        endpoint: configuration.rumEndpointBuilder,
        encoder: createEncoder(2 /* DeflateEncoderStreamId.RUM */),
    }, replica && {
        endpoint: replica.rumEndpointBuilder,
        transformMessage: function (message) { return combine(message, { application: { id: replica.applicationId } }); },
        encoder: createEncoder(3 /* DeflateEncoderStreamId.RUM_REPLICA */),
    }, reportError, pageExitObservable, sessionExpireObservable);
    lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, function (serverRumEvent) {
        if (serverRumEvent.type === "view" /* RumEventType.VIEW */) {
            batch.upsert(serverRumEvent, serverRumEvent.view.id);
        }
        else {
            batch.add(serverRumEvent);
        }
    });
    telemetryEventObservable.subscribe(function (event) { return batch.add(event, isTelemetryReplicationAllowed(configuration)); });
    return batch;
}
//# sourceMappingURL=startRumBatch.js.map