"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLongTaskCollection = startLongTaskCollection;
var browser_core_1 = require("@datadog/browser-core");
var performanceCollection_1 = require("../../browser/performanceCollection");
function startLongTaskCollection(lifeCycle, configuration) {
    lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType !== performanceCollection_1.RumPerformanceEntryType.LONG_TASK) {
                break;
            }
            if (!configuration.trackLongTasks) {
                break;
            }
            var startClocks = (0, browser_core_1.relativeToClocks)(entry.startTime);
            var rawRumEvent = {
                date: startClocks.timeStamp,
                long_task: {
                    id: (0, browser_core_1.generateUUID)(),
                    duration: (0, browser_core_1.toServerDuration)(entry.duration),
                },
                type: "long_task" /* RumEventType.LONG_TASK */,
                _dd: {
                    discarded: false,
                },
            };
            lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, {
                rawRumEvent: rawRumEvent,
                startTime: startClocks.relative,
                domainContext: { performanceEntry: entry },
            });
        }
    });
}
//# sourceMappingURL=longTaskCollection.js.map