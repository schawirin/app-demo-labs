import type { RumConfiguration, RumSessionManager, ViewContexts } from '@datadog/browser-rum-core';
export declare function getSessionReplayLink(configuration: RumConfiguration, sessionManager: RumSessionManager, viewContexts: ViewContexts, isRecordingStarted: boolean): string | undefined;
