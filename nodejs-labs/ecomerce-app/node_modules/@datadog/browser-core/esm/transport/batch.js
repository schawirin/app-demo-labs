import { DOCS_ORIGIN, display } from '../tools/display';
import { objectValues } from '../tools/utils/polyfills';
import { isPageExitReason } from '../browser/pageExitObservable';
import { jsonStringify } from '../tools/serialisation/jsonStringify';
import { computeBytesCount } from '../tools/utils/byteUtils';
var Batch = /** @class */ (function () {
    function Batch(encoder, request, flushController, messageBytesLimit) {
        var _this = this;
        this.encoder = encoder;
        this.request = request;
        this.flushController = flushController;
        this.messageBytesLimit = messageBytesLimit;
        this.upsertBuffer = {};
        this.flushSubscription = this.flushController.flushObservable.subscribe(function (event) { return _this.flush(event); });
    }
    Batch.prototype.add = function (message) {
        this.addOrUpdate(message);
    };
    Batch.prototype.upsert = function (message, key) {
        this.addOrUpdate(message, key);
    };
    Batch.prototype.stop = function () {
        this.flushSubscription.unsubscribe();
    };
    Batch.prototype.flush = function (event) {
        var upsertMessages = objectValues(this.upsertBuffer).join('\n');
        this.upsertBuffer = {};
        var isPageExit = isPageExitReason(event.reason);
        var send = isPageExit ? this.request.sendOnExit : this.request.send;
        if (isPageExit &&
            // Note: checking that the encoder is async is not strictly needed, but it's an optimization:
            // if the encoder is async we need to send two requests in some cases (one for encoded data
            // and the other for non-encoded data). But if it's not async, we don't have to worry about
            // it and always send a single request.
            this.encoder.isAsync) {
            var encoderResult = this.encoder.finishSync();
            // Send encoded messages
            if (encoderResult.outputBytesCount) {
                send(formatPayloadFromEncoder(encoderResult));
            }
            // Send messages that are not yet encoded at this point
            var pendingMessages = [encoderResult.pendingData, upsertMessages].filter(Boolean).join('\n');
            if (pendingMessages) {
                send({
                    data: pendingMessages,
                    bytesCount: computeBytesCount(pendingMessages),
                });
            }
        }
        else {
            if (upsertMessages) {
                this.encoder.write(this.encoder.isEmpty ? upsertMessages : "\n".concat(upsertMessages));
            }
            this.encoder.finish(function (encoderResult) {
                send(formatPayloadFromEncoder(encoderResult));
            });
        }
    };
    Batch.prototype.addOrUpdate = function (message, key) {
        var serializedMessage = jsonStringify(message);
        var estimatedMessageBytesCount = this.encoder.estimateEncodedBytesCount(serializedMessage);
        if (estimatedMessageBytesCount >= this.messageBytesLimit) {
            display.warn("Discarded a message whose size was bigger than the maximum allowed size ".concat(this.messageBytesLimit, "KB. More details: ").concat(DOCS_ORIGIN, "/real_user_monitoring/browser/troubleshooting/#technical-limitations"));
            return;
        }
        if (this.hasMessageFor(key)) {
            this.remove(key);
        }
        this.push(serializedMessage, estimatedMessageBytesCount, key);
    };
    Batch.prototype.push = function (serializedMessage, estimatedMessageBytesCount, key) {
        var _this = this;
        this.flushController.notifyBeforeAddMessage(estimatedMessageBytesCount);
        if (key !== undefined) {
            this.upsertBuffer[key] = serializedMessage;
            this.flushController.notifyAfterAddMessage();
        }
        else {
            this.encoder.write(this.encoder.isEmpty ? serializedMessage : "\n".concat(serializedMessage), function (realMessageBytesCount) {
                _this.flushController.notifyAfterAddMessage(realMessageBytesCount - estimatedMessageBytesCount);
            });
        }
    };
    Batch.prototype.remove = function (key) {
        var removedMessage = this.upsertBuffer[key];
        delete this.upsertBuffer[key];
        var messageBytesCount = this.encoder.estimateEncodedBytesCount(removedMessage);
        this.flushController.notifyAfterRemoveMessage(messageBytesCount);
    };
    Batch.prototype.hasMessageFor = function (key) {
        return key !== undefined && this.upsertBuffer[key] !== undefined;
    };
    return Batch;
}());
export { Batch };
function formatPayloadFromEncoder(encoderResult) {
    var data;
    if (typeof encoderResult.output === 'string') {
        data = encoderResult.output;
    }
    else {
        data = new Blob([encoderResult.output], {
            // This will set the 'Content-Type: text/plain' header. Reasoning:
            // * The intake rejects the request if there is no content type.
            // * The browser will issue CORS preflight requests if we set it to 'application/json', which
            // could induce higher intake load (and maybe has other impacts).
            // * Also it's not quite JSON, since we are concatenating multiple JSON objects separated by
            // new lines.
            type: 'text/plain',
        });
    }
    return {
        data: data,
        bytesCount: encoderResult.outputBytesCount,
        encoding: encoderResult.encoding,
    };
}
//# sourceMappingURL=batch.js.map