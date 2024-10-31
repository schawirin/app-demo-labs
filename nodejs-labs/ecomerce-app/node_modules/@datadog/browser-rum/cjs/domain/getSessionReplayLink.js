"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionReplayLink = getSessionReplayLink;
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var isBrowserSupported_1 = require("../boot/isBrowserSupported");
function getSessionReplayLink(configuration, sessionManager, viewContexts, isRecordingStarted) {
    var session = sessionManager.findTrackedSession();
    var errorType = getErrorType(session, isRecordingStarted);
    var viewContext = viewContexts.findView();
    return (0, browser_rum_core_1.getSessionReplayUrl)(configuration, {
        viewContext: viewContext,
        errorType: errorType,
        session: session,
    });
}
function getErrorType(session, isRecordingStarted) {
    if (!(0, isBrowserSupported_1.isBrowserSupported)()) {
        return 'browser-not-supported';
    }
    if (!session) {
        // possibilities:
        // - rum sampled out
        // - session expired (edge case)
        return 'rum-not-tracked';
    }
    if (session.sessionReplay === 0 /* SessionReplayState.OFF */) {
        // possibilities
        // - replay sampled out
        return 'incorrect-session-plan';
    }
    if (!isRecordingStarted) {
        return 'replay-not-started';
    }
}
//# sourceMappingURL=getSessionReplayLink.js.map