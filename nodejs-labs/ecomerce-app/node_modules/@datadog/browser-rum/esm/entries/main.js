// Keep the following in sync with packages/rum-slim/src/entries/main.ts
import { defineGlobal, getGlobalObject } from '@datadog/browser-core';
import { makeRumPublicApi, startRum } from '@datadog/browser-rum-core';
import { startRecording } from '../boot/startRecording';
import { makeRecorderApi } from '../boot/recorderApi';
import { createDeflateEncoder, startDeflateWorker } from '../domain/deflate';
export { DefaultPrivacyLevel } from '@datadog/browser-core';
var recorderApi = makeRecorderApi(startRecording);
export var datadogRum = makeRumPublicApi(startRum, recorderApi, { startDeflateWorker: startDeflateWorker, createDeflateEncoder: createDeflateEncoder });
defineGlobal(getGlobalObject(), 'DD_RUM', datadogRum);
//# sourceMappingURL=main.js.map