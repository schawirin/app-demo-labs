"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackConsoleError = trackConsoleError;
var browser_core_1 = require("@datadog/browser-core");
function trackConsoleError(errorObservable) {
    var subscription = (0, browser_core_1.initConsoleObservable)([browser_core_1.ConsoleApiName.error]).subscribe(function (consoleError) {
        return errorObservable.notify({
            startClocks: (0, browser_core_1.clocksNow)(),
            message: consoleError.message,
            stack: consoleError.stack,
            fingerprint: consoleError.fingerprint,
            source: browser_core_1.ErrorSource.CONSOLE,
            handling: "handled" /* ErrorHandling.HANDLED */,
            handlingStack: consoleError.handlingStack,
        });
    });
    return {
        stop: function () {
            subscription.unsubscribe();
        },
    };
}
//# sourceMappingURL=trackConsoleError.js.map