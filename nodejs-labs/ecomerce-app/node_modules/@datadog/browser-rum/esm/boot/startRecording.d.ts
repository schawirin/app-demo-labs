import type { HttpRequest, DeflateEncoder } from '@datadog/browser-core';
import type { LifeCycle, ViewContexts, RumConfiguration, RumSessionManager } from '@datadog/browser-rum-core';
export declare function startRecording(lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, viewContexts: ViewContexts, encoder: DeflateEncoder, httpRequest?: HttpRequest): {
    stop: () => void;
};
