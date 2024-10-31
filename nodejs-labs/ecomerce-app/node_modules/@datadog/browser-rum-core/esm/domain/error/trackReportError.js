import { clocksNow, ErrorSource, initReportObservable, RawReportType } from '@datadog/browser-core';
export function trackReportError(configuration, errorObservable) {
    var subscription = initReportObservable(configuration, [
        RawReportType.cspViolation,
        RawReportType.intervention,
    ]).subscribe(function (reportError) {
        var rawError = {
            startClocks: clocksNow(),
            message: reportError.message,
            stack: reportError.stack,
            type: reportError.subtype,
            source: ErrorSource.REPORT,
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