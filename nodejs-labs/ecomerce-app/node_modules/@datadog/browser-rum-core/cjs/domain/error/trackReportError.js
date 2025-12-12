"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackReportError = trackReportError;
var browser_core_1 = require("@datadog/browser-core");
function trackReportError(configuration, errorObservable) {
    var subscription = (0, browser_core_1.initReportObservable)(configuration, [
        browser_core_1.RawReportType.cspViolation,
        browser_core_1.RawReportType.intervention,
    ]).subscribe(function (reportError) {
        var rawError = {
            startClocks: (0, browser_core_1.clocksNow)(),
            message: reportError.message,
            stack: reportError.stack,
            type: reportError.subtype,
            source: browser_core_1.ErrorSource.REPORT,
            handling: "unhandled" /* ErrorHandling.UNHANDLED */,
            originalError: reportError.originalReport,
        };
        if (reportError.originalReport.type === 'securitypolicyviolation') {
            rawError.csp = {
                disposition: reportError.originalReport.disposition,
            };
        }
        return errorObservable.notify(rawError);
    });
    return {
        stop: function () {
            subscription.unsubscribe();
        },
    };
}
//# sourceMappingURL=trackReportError.js.map