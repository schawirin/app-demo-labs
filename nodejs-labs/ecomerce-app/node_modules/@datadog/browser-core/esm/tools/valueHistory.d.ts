import type { Duration, RelativeTime } from './utils/timeUtils';
export interface ValueHistoryEntry<T> {
    startTime: RelativeTime;
    endTime: RelativeTime;
    value: T;
    remove(): void;
    close(endTime: RelativeTime): void;
}
export declare const CLEAR_OLD_VALUES_INTERVAL: number;
/**
 * Store and keep track of values spans. This whole class assumes that values are added in
 * chronological order (i.e. all entries have an increasing start time).
 */
export declare class ValueHistory<Value> {
    private expireDelay;
    private maxEntries?;
    private entries;
    private clearOldValuesInterval;
    constructor(expireDelay: number, maxEntries?: number | undefined);
    /**
     * Add a value to the history associated with a start time. Returns a reference to this newly
     * added entry that can be removed or closed.
     */
    add(value: Value, startTime: RelativeTime): ValueHistoryEntry<Value>;
    /**
     * Return the latest value that was active during `startTime`, or the currently active value
     * if no `startTime` is provided. This method assumes that entries are not overlapping.
     *
     * If `option.returnInactive` is true, returns the value at `startTime` (active or not).
     */
    find(startTime?: RelativeTime, options?: {
        returnInactive: boolean;
    }): Value | undefined;
    /**
     * Helper function to close the currently active value, if any. This method assumes that entries
     * are not overlapping.
     */
    closeActive(endTime: RelativeTime): void;
    /**
     * Return all values with an active period overlapping with the duration,
     * or all values that were active during `startTime` if no duration is provided,
     * or all currently active values if no `startTime` is provided.
     */
    findAll(startTime?: RelativeTime, duration?: Duration): Value[];
    /**
     * Remove all entries from this collection.
     */
    reset(): void;
    /**
     * Stop internal garbage collection of past entries.
     */
    stop(): void;
    private clearOldValues;
}
