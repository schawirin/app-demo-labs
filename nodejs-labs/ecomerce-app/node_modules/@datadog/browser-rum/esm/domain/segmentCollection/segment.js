import { assign } from '@datadog/browser-core';
import { RecordType } from '../../types';
import * as replayStats from '../replayStats';
var Segment = /** @class */ (function () {
    function Segment(encoder, context, creationReason) {
        this.encoder = encoder;
        this.encodedBytesCount = 0;
        var viewId = context.view.id;
        this.metadata = assign({
            start: Infinity,
            end: -Infinity,
            creation_reason: creationReason,
            records_count: 0,
            has_full_snapshot: false,
            index_in_view: replayStats.getSegmentsCount(viewId),
            source: 'browser',
        }, context);
        replayStats.addSegment(viewId);
    }
    Segment.prototype.addRecord = function (record, callback) {
        var _this = this;
        var _a;
        this.metadata.start = Math.min(this.metadata.start, record.timestamp);
        this.metadata.end = Math.max(this.metadata.end, record.timestamp);
        this.metadata.records_count += 1;
        (_a = this.metadata).has_full_snapshot || (_a.has_full_snapshot = record.type === RecordType.FullSnapshot);
        var prefix = this.encoder.isEmpty ? '{"records":[' : ',';
        this.encoder.write(prefix + JSON.stringify(record), function (additionalEncodedBytesCount) {
            _this.encodedBytesCount += additionalEncodedBytesCount;
            callback(_this.encodedBytesCount);
        });
    };
    Segment.prototype.flush = function (callback) {
        var _this = this;
        if (this.encoder.isEmpty) {
            throw new Error('Empty segment flushed');
        }
        this.encoder.write("],".concat(JSON.stringify(this.metadata).slice(1), "\n"));
        this.encoder.finish(function (encoderResult) {
            replayStats.addWroteData(_this.metadata.view.id, encoderResult.rawBytesCount);
            callback(_this.metadata, encoderResult);
        });
    };
    return Segment;
}());
export { Segment };
//# sourceMappingURL=segment.js.map