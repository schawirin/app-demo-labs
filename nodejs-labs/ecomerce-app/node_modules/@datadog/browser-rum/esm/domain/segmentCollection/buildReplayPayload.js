import { assign } from '@datadog/browser-core';
export function buildReplayPayload(data, metadata, rawSegmentBytesCount) {
    var formData = new FormData();
    formData.append('segment', new Blob([data], {
        type: 'application/octet-stream',
    }), "".concat(metadata.session.id, "-").concat(metadata.start));
    var metadataAndSegmentSizes = assign({
        raw_segment_size: rawSegmentBytesCount,
        compressed_segment_size: data.byteLength,
    }, metadata);
    var serializedMetadataAndSegmentSizes = JSON.stringify(metadataAndSegmentSizes);
    formData.append('event', new Blob([serializedMetadataAndSegmentSizes], { type: 'application/json' }));
    return { data: formData, bytesCount: data.byteLength };
}
//# sourceMappingURL=buildReplayPayload.js.map