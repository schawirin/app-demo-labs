import { addEventListener, addTelemetryDebug, assign, concatBuffers } from '@datadog/browser-core';
export function createDeflateEncoder(configuration, worker, streamId) {
    var rawBytesCount = 0;
    var compressedData = [];
    var compressedDataTrailer;
    var nextWriteActionId = 0;
    var pendingWriteActions = [];
    var removeMessageListener = addEventListener(configuration, worker, 'message', function (_a) {
        var workerResponse = _a.data;
        if (workerResponse.type !== 'wrote' || workerResponse.streamId !== streamId) {
            return;
        }
        rawBytesCount += workerResponse.additionalBytesCount;
        compressedData.push(workerResponse.result);
        compressedDataTrailer = workerResponse.trailer;
        var nextPendingAction = pendingWriteActions.shift();
        if (nextPendingAction && nextPendingAction.id === workerResponse.id) {
            if (nextPendingAction.writeCallback) {
                nextPendingAction.writeCallback(workerResponse.result.byteLength);
            }
            else if (nextPendingAction.finishCallback) {
                nextPendingAction.finishCallback();
            }
        }
        else {
            removeMessageListener();
            addTelemetryDebug('Worker responses received out of order.');
        }
    }).stop;
    function consumeResult() {
        var output = compressedData.length === 0 ? new Uint8Array(0) : concatBuffers(compressedData.concat(compressedDataTrailer));
        var result = {
            rawBytesCount: rawBytesCount,
            output: output,
            outputBytesCount: output.byteLength,
            encoding: 'deflate',
        };
        rawBytesCount = 0;
        compressedData = [];
        return result;
    }
    function sendResetIfNeeded() {
        if (nextWriteActionId > 0) {
            worker.postMessage({
                action: 'reset',
                streamId: streamId,
            });
            nextWriteActionId = 0;
        }
    }
    return {
        isAsync: true,
        get isEmpty() {
            return nextWriteActionId === 0;
        },
        write: function (data, callback) {
            worker.postMessage({
                action: 'write',
                id: nextWriteActionId,
                data: data,
                streamId: streamId,
            });
            pendingWriteActions.push({
                id: nextWriteActionId,
                writeCallback: callback,
                data: data,
            });
            nextWriteActionId += 1;
        },
        finish: function (callback) {
            sendResetIfNeeded();
            if (!pendingWriteActions.length) {
                callback(consumeResult());
            }
            else {
                // Make sure we do not call any write callback
                pendingWriteActions.forEach(function (pendingWriteAction) {
                    delete pendingWriteAction.writeCallback;
                });
                // Wait for the last action to finish before calling the finish callback
                pendingWriteActions[pendingWriteActions.length - 1].finishCallback = function () { return callback(consumeResult()); };
            }
        },
        finishSync: function () {
            sendResetIfNeeded();
            var pendingData = pendingWriteActions
                .map(function (pendingWriteAction) {
                // Make sure we do not call any write or finish callback
                delete pendingWriteAction.writeCallback;
                delete pendingWriteAction.finishCallback;
                return pendingWriteAction.data;
            })
                .join('');
            return assign(consumeResult(), {
                pendingData: pendingData,
            });
        },
        estimateEncodedBytesCount: function (data) {
            // This is a rough estimation of the data size once it'll be encoded by deflate. We observed
            // that if it's the first chunk of data pushed to the stream, the ratio is lower (3-4), but
            // after that the ratio is greater (10+). We chose 8 here, which (on average) seems to produce
            // requests of the expected size.
            return data.length / 8;
        },
        stop: function () {
            removeMessageListener();
        },
    };
}
//# sourceMappingURL=deflateEncoder.js.map