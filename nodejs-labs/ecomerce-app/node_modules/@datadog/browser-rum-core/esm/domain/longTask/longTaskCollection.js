import { toServerDuration, relativeToClocks, generateUUID } from '@datadog/browser-core';
import { RumPerformanceEntryType } from '../../browser/performanceCollection';
export function startLongTaskCollection(lifeCycle, configuration) {
    lifeCycle.subscribe(0 /* LifeCycleEventType.PERFORMANCE_ENTRIES_COLLECTED */, function (entries) {
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (entry.entryType !== RumPerformanceEntryType.LONG_TASK) {
                break;
            }
            if (!configuration.trackLongTasks) {
                break;
            }
            var startClocks = relativeToClocks(entry.startTime);
            var rawRumEvent = {
                date: startClocks.timeStamp,
                long_task: {
                    id: generateUUID(),
                    duration: toServerDuration(entry.duration),
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