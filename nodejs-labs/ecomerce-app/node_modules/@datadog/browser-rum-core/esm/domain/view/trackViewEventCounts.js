import { trackEventCounts } from '../trackEventCounts';
export function trackViewEventCounts(lifeCycle, viewId, onChange) {
    var _a = trackEventCounts({
        lifeCycle: lifeCycle,
        isChildEvent: function (event) { return event.view.id === viewId; },
        onChange: onChange,
    }), stop = _a.stop, eventCounts = _a.eventCounts;
    return {
        stop: stop,
        eventCounts: eventCounts,
    };
}
//# sourceMappingURL=trackViewEventCounts.js.map