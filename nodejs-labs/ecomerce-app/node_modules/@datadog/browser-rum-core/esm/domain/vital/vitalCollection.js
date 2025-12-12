import { combine, elapsed, generateUUID } from '@datadog/browser-core';
export function startVitalCollection(lifeCycle, pageStateHistory) {
    var vitalStartsByName = new Map();
    lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, function () {
        // Discard all the vitals that have not been stopped to avoid memory leaks
        vitalStartsByName.clear();
    });
    function isValid(vital) {
        return !pageStateHistory.wasInPageStateDuringPeriod("frozen" /* PageState.FROZEN */, vital.startClocks.relative, vital.value);
    }
    return {
        startDurationVital: function (vitalStart) {
            vitalStartsByName.set(vitalStart.name, vitalStart);
        },
        stopDurationVital: function (vitalStop) {
            var vitalStart = vitalStartsByName.get(vitalStop.name);
            if (!vitalStart) {
                return;
            }
            var vital = buildDurationVital(vitalStart, vitalStop);
            vitalStartsByName.delete(vital.name);
            if (isValid(vital)) {
                lifeCycle.notify(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, processVital(vital, true));
            }
        },
    };
}
function buildDurationVital(vitalStart, vitalStop) {
    return {
        name: vitalStart.name,
        type: "duration" /* VitalType.DURATION */,
        startClocks: vitalStart.startClocks,
        value: elapsed(vitalStart.startClocks.timeStamp, vitalStop.stopClocks.timeStamp),
        context: combine(vitalStart.context, vitalStop.context),
    };
}
function processVital(vital, valueComputedBySdk) {
    var _a;
    var rawRumEvent = {
        date: vital.startClocks.timeStamp,
        vital: {
            id: generateUUID(),
            type: vital.type,
            name: vital.name,
            custom: (_a = {},
                _a[vital.name] = vital.value,
                _a),
        },
        type: "vital" /* RumEventType.VITAL */,
    };
    if (valueComputedBySdk) {
        rawRumEvent._dd = {
            vital: {
                computed_value: true,
            },
        };
    }
    return {
        rawRumEvent: rawRumEvent,
        startTime: vital.startClocks.relative,
        customerContext: vital.context,
        domainContext: {},
    };
}
//# sourceMappingURL=vitalCollection.js.map