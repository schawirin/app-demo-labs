import { getSessionReplayUrl } from '@datadog/browser-rum-core';
import { isBrowserSupported } from '../boot/isBrowserSupported';
export function getSessionReplayLink(configuration, sessionManager, viewContexts, isRecordingStarted) {
    var session = sessionManager.findTrackedSession();
    var errorType = getErrorType(session, isRecordingStarted);
    var viewContext = viewContexts.findView();
    return getSessionReplayUrl(configuration, {
        viewContext: viewContext,
        errorType: errorType,
        session: session,
    });
}
function getErrorType(session, isRecordingStarted) {
    if (!isBrowserSupported()) {
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