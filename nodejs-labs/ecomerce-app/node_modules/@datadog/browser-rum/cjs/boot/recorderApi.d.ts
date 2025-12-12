import type { RecorderApi } from '@datadog/browser-rum-core';
import type { CreateDeflateWorker } from '../domain/deflate';
import type { startRecording } from './startRecording';
export type StartRecording = typeof startRecording;
export declare function makeRecorderApi(startRecordingImpl: StartRecording, createDeflateWorkerImpl?: CreateDeflateWorker): RecorderApi;
