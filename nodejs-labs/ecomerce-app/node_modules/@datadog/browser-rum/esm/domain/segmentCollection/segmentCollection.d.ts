import type { DeflateEncoder, HttpRequest } from '@datadog/browser-core';
import type { LifeCycle, ViewContexts, RumSessionManager, RumConfiguration } from '@datadog/browser-rum-core';
import type { BrowserRecord, SegmentContext } from '../../types';
export declare const SEGMENT_DURATION_LIMIT: number;
/**
 * beacon payload max queue size implementation is 64kb
 * ensure that we leave room for logs, rum and potential other users
 */
export declare let SEGMENT_BYTES_LIMIT: number;
export declare function startSegmentCollection(lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, viewContexts: ViewContexts, httpRequest: HttpRequest, encoder: DeflateEncoder): {
    addRecord: (record: BrowserRecord) => void;
    stop: () => void;
};
export declare function doStartSegmentCollection(lifeCycle: LifeCycle, getSegmentContext: () => SegmentContext | undefined, httpRequest: HttpRequest, encoder: DeflateEncoder): {
    addRecord: (record: BrowserRecord) => void;
    stop: () => void;
};
export declare function computeSegmentContext(applicationId: string, sessionManager: RumSessionManager, viewContexts: ViewContexts): {
    application: {
        id: string;
    };
    session: {
        id: string;
    };
    view: {
        id: string;
    };
} | undefined;
export declare function setSegmentBytesLimit(newSegmentBytesLimit?: number): void;
