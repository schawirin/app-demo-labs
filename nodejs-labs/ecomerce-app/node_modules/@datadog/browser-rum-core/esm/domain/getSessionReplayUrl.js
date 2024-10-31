import { INTAKE_SITE_STAGING, INTAKE_SITE_US1, INTAKE_SITE_EU1 } from '@datadog/browser-core';
export function getSessionReplayUrl(configuration, _a) {
    var session = _a.session, viewContext = _a.viewContext, errorType = _a.errorType;
    var sessionId = session ? session.id : 'no-session-id';
    var parameters = [];
    if (errorType !== undefined) {
        parameters.push("error-type=".concat(errorType));
    }
    if (viewContext) {
        parameters.push("seed=".concat(viewContext.id));
        parameters.push("from=".concat(viewContext.startClocks.timeStamp));
    }
    var origin = getDatadogSiteUrl(configuration);
    var path = "/rum/replay/sessions/".concat(sessionId);
    return "".concat(origin).concat(path, "?").concat(parameters.join('&'));
}
export function getDatadogSiteUrl(rumConfiguration) {
    var site = rumConfiguration.site;
    var subdomain = rumConfiguration.subdomain || getSiteDefaultSubdomain(rumConfiguration);
    return "https://".concat(subdomain ? "".concat(subdomain, ".") : '').concat(site);
}
function getSiteDefaultSubdomain(configuration) {
    switch (configuration.site) {
        case INTAKE_SITE_US1:
        case INTAKE_SITE_EU1:
            return 'app';
        case INTAKE_SITE_STAGING:
            return 'dd';
        default:
            return undefined;
    }
}
//# sourceMappingURL=getSessionReplayUrl.js.map