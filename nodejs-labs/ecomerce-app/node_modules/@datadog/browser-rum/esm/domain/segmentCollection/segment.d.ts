import type { Encoder, EncoderResult } from '@datadog/browser-core';
import type { BrowserRecord, BrowserSegmentMetadata, CreationReason, SegmentContext } from '../../types';
export type FlushReason = Exclude<CreationReason, 'init'> | 'stop';
export type FlushCallback = (metadata: BrowserSegmentMetadata, encoderResult: EncoderResult<Uint8Array>) => void;
export type AddRecordCallback = (encodedBytesCount: number) => void;
export declare class Segment {
    private encoder;
    private metadata;
    private encodedBytesCount;
    constructor(encoder: Encoder<Uint8Array>, context: SegmentContext, creationReason: CreationReason);
    addRecord(record: BrowserRecord, callback: AddRecordCallback): void;
    flush(callback: FlushCallback): void;
}
