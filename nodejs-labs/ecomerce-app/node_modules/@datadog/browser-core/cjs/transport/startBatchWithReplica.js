"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBatchWithReplica = startBatchWithReplica;
var batch_1 = require("./batch");
var httpRequest_1 = require("./httpRequest");
var flushController_1 = require("./flushController");
function startBatchWithReplica(configuration, primary, replica, reportError, pageExitObservable, sessionExpireObservable) {
    var primaryBatch = createBatch(configuration, primary);
    var replicaBatch = replica && createBatch(configuration, replica);
    function createBatch(configuration, _a) {
        var endpoint = _a.endpoint, encoder = _a.encoder;
        return new batch_1.Batch(encoder, (0, httpRequest_1.createHttpRequest)(configuration, endpoint, configuration.batchBytesLimit, reportError), (0, flushController_1.createFlushController)({
            messagesLimit: configuration.batchMessagesLimit,
            bytesLimit: configuration.batchBytesLimit,
            durationLimit: configuration.flushTimeout,
            pageExitObservable: pageExitObservable,
            sessionExpireObservable: sessionExpireObservable,
        }), configuration.messageBytesLimit);
    }
    return {
        flushObservable: primaryBatch.flushController.flushObservable,
        add: function (message, replicated) {
            if (replicated === void 0) { replicated = true; }
            primaryBatch.add(message);
            if (replicaBatch && replicated) {
                replicaBatch.add(replica.transformMessage ? replica.transformMessage(message) : message);
            }
        },
        upsert: function (message, key) {
            primaryBatch.upsert(message, key);
            if (replicaBatch) {
                replicaBatch.upsert(replica.transformMessage ? replica.transformMessage(message) : message, key);
            }
        },
        stop: function () {
            primaryBatch.stop();
            replicaBatch === null || replicaBatch === void 0 ? void 0 : replicaBatch.stop();
        },
    };
}
//# sourceMappingURL=startBatchWithReplica.js.map