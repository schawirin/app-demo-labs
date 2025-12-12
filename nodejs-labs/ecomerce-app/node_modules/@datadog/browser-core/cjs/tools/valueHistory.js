"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueHistory = exports.CLEAR_OLD_VALUES_INTERVAL = void 0;
var timer_1 = require("./timer");
var arrayUtils_1 = require("./utils/arrayUtils");
var timeUtils_1 = require("./utils/timeUtils");
var END_OF_TIMES = Infinity;
exports.CLEAR_OLD_VALUES_INTERVAL = timeUtils_1.ONE_MINUTE;
/**
 * Store and keep track of values spans. This whole class assumes that values are added in
 * chronological order (i.e. all entries have an increasing start time).
 */
var ValueHistory = /** @class */ (function () {
    function ValueHistory(expireDelay, maxEntries) {
        var _this = this;
        this.expireDelay = expireDelay;
        this.maxEntries = maxEntries;
        this.entries = [];
        this.clearOldValuesInterval = (0, timer_1.setInterval)(function () { return _this.clearOldValues(); }, exports.CLEAR_OLD_VALUES_INTERVAL);
    }
    /**
     * Add a value to the history associated with a start time. Returns a reference to this newly
     * added entry that can be removed or closed.
     */
    ValueHistory.prototype.add = function (value, startTime) {
        var _this = this;
        var entry = {
            value: value,
            startTime: startTime,
            endTime: END_OF_TIMES,
            remove: function () {
                (0, arrayUtils_1.removeItem)(_this.entries, entry);
            },
            close: function (endTime) {
                entry.endTime = endTime;
            },
        };
        if (this.maxEntries && this.entries.length >= this.maxEntries) {
            this.entries.pop();
        }
        this.entries.unshift(entry);
        return entry;
    };
    /**
     * Return the latest value that was active during `startTime`, or the currently active value
     * if no `startTime` is provided. This method assumes that entries are not overlapping.
     *
     * If `option.returnInactive` is true, returns the value at `startTime` (active or not).
     */
    ValueHistory.prototype.find = function (startTime, options) {
        if (startTime === void 0) { startTime = END_OF_TIMES; }
        if (options === void 0) { options = { returnInactive: false }; }
        for (var _i = 0, _a = this.entries; _i < _a.length; _i++) {
            var entry = _a[_i];
            if (entry.startTime <= startTime) {
                if (options.returnInactive || startTime <= entry.endTime) {
                    return entry.value;
                }
                break;
            }
        }
    };
    /**
     * Helper function to close the currently active value, if any. This method assumes that entries
     * are not overlapping.
     */
    ValueHistory.prototype.closeActive = function (endTime) {
        var latestEntry = this.entries[0];
        if (latestEntry && latestEntry.endTime === END_OF_TIMES) {
            latestEntry.close(endTime);
        }
    };
    /**
     * Return all values with an active period overlapping with the duration,
     * or all values that were active during `startTime` if no duration is provided,
     * or all currently active values if no `startTime` is provided.
     */
    ValueHistory.prototype.findAll = function (startTime, duration) {
        if (startTime === void 0) { startTime = END_OF_TIMES; }
        if (duration === void 0) { duration = 0; }
        var endTime = (0, timeUtils_1.addDuration)(startTime, duration);
        return this.entries
            .filter(function (entry) { return entry.startTime <= endTime && startTime <= entry.endTime; })
            .map(function (entry) { return entry.value; });
    };
    /**
     * Remove all entries from this collection.
     */
    ValueHistory.prototype.reset = function () {
        this.entries = [];
    };
    /**
     * Stop internal garbage collection of past entries.
     */
    ValueHistory.prototype.stop = function () {
        (0, timer_1.clearInterval)(this.clearOldValuesInterval);
    };
    ValueHistory.prototype.clearOldValues = function () {
        var oldTimeThreshold = (0, timeUtils_1.relativeNow)() - this.expireDelay;
        while (this.entries.length > 0 && this.entries[this.entries.length - 1].endTime < oldTimeThreshold) {
            this.entries.pop();
        }
    };
    return ValueHistory;
}());
exports.ValueHistory = ValueHistory;
//# sourceMappingURL=valueHistory.js.map