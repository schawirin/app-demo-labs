"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackViewEventCounts = trackViewEventCounts;
var trackEventCounts_1 = require("../trackEventCounts");
function trackViewEventCounts(lifeCycle, viewId, onChange) {
    var _a = (0, trackEventCounts_1.trackEventCounts)({
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