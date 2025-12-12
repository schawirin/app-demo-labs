"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRumEventBridge = startRumEventBridge;
var browser_core_1 = require("@datadog/browser-core");
function startRumEventBridge(lifeCycle) {
    var bridge = (0, browser_core_1.getEventBridge)();
    lifeCycle.subscribe(13 /* LifeCycleEventType.RUM_EVENT_COLLECTED */, function (serverRumEvent) {
        bridge.send('rum', serverRumEvent);
    });
}
//# sourceMappingURL=startRumEventBridge.js.map