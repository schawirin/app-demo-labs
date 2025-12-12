import type { ViewContexts } from '@datadog/browser-rum-core';
import type { BrowserRecord } from '../types';
export declare function startRecordBridge(viewContexts: ViewContexts): {
    addRecord: (record: BrowserRecord) => void;
};
