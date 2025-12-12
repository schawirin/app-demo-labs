"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackViewEnd = trackViewEnd;
var browser_core_1 = require("@datadog/browser-core");
var types_1 = require("../../../types");
function trackViewEnd(lifeCycle, viewEndCb) {
    var viewEndSubscription = lifeCycle.subscribe(5 /* LifeCycleEventType.VIEW_ENDED */, function () {
        viewEndCb({
            timestamp: (0, browser_core_1.timeStampNow)(),
            type: types_1.RecordType.ViewEnd,
        });
    });
    return {
        stop: function () {
            viewEndSubscription.unsubscribe();
        },
    };
}
//# sourceMappingURL=trackViewEnd.js.map