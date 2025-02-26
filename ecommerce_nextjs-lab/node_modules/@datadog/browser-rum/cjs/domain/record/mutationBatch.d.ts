import type { RumMutationRecord } from './trackers';
/**
 * Minimum duration to wait before processing mutations. This is used to batch mutations together
 * and be able to deduplicate them to save processing time and bandwidth.
 * 16ms is the duration of a frame at 60fps that ensure fluid UI.
 */
export declare const MUTATION_PROCESS_MIN_DELAY = 16;
export declare function createMutationBatch(processMutationBatch: (mutations: RumMutationRecord[]) => void): {
    addMutations: (mutations: RumMutationRecord[]) => void;
    flush: () => void;
    stop: () => void;
};
