import type { LifeCycle, RumConfiguration, ViewContexts } from '@datadog/browser-rum-core';
import type { BrowserRecord } from '../../types';
import type { ShadowRootsController } from './shadowRootsController';
export interface RecordOptions {
    emit?: (record: BrowserRecord) => void;
    configuration: RumConfiguration;
    lifeCycle: LifeCycle;
    viewContexts: ViewContexts;
}
export interface RecordAPI {
    stop: () => void;
    flushMutations: () => void;
    shadowRootsController: ShadowRootsController;
}
export declare function record(options: RecordOptions): RecordAPI;
