import type { Payload } from '@datadog/browser-core';
import type { BrowserSegmentMetadata } from '../../types';
export type BrowserSegmentMetadataAndSegmentSizes = BrowserSegmentMetadata & {
    raw_segment_size: number;
    compressed_segment_size: number;
};
export declare function buildReplayPayload(data: Uint8Array, metadata: BrowserSegmentMetadata, rawSegmentBytesCount: number): Payload;
