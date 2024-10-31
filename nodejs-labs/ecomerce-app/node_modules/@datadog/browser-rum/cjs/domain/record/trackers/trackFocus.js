"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackFocus = trackFocus;
var browser_core_1 = require("@datadog/browser-core");
var types_1 = require("../../../types");
function trackFocus(configuration, focusCb) {
    return (0, browser_core_1.addEventListeners)(configuration, window, [browser_core_1.DOM_EVENT.FOCUS, browser_core_1.DOM_EVENT.BLUR], function () {
        focusCb({
            data: { has_focus: document.hasFocus() },
            type: types_1.RecordType.Focus,
            timestamp: (0, browser_core_1.timeStampNow)(),
        });
    });
}
//# sourceMappingURL=trackFocus.js.map