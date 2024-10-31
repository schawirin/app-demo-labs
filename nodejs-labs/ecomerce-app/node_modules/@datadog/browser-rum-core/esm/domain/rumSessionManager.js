import { Observable, bridgeSupports, noop, performDraw, startSessionManager, } from '@datadog/browser-core';
export var RUM_SESSION_KEY = 'rum';
export function startRumSessionManager(configuration, lifeCycle, trackingConsentState) {
    var sessionManager = startSessionManager(configuration, RUM_SESSION_KEY, function (rawTrackingType) { return computeSessionState(configuration, rawTrackingType); }, trackingConsentState);
    sessionManager.expireObservable.subscribe(function () {
        lifeCycle.notify(9 /* LifeCycleEventType.SESSION_EXPIRED */);
    });
    sessionManager.renewObservable.subscribe(function () {
        lifeCycle.notify(10 /* LifeCycleEventType.SESSION_RENEWED */);
    });
    sessionManager.sessionStateUpdateObservable.subscribe(function (_a) {
        var previousState = _a.previousState, newState = _a.newState;
        if (!previousState.forcedReplay && newState.forcedReplay) {
            var sessionEntity = sessionManager.findSession();
            if (sessionEntity) {
                sessionEntity.isReplayForced = true;
            }
        }
    });
    return {
        findTrackedSession: function (startTime) {
            var session = sessionManager.findSession(startTime);
            if (!session || !isTypeTracked(session.trackingType)) {
                return;
            }
            return {
                id: session.id,
                sessionReplay: session.trackingType === "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */
                    ? 1 /* SessionReplayState.SAMPLED */
                    : session.isReplayForced
                        ? 2 /* SessionReplayState.FORCED */
                        : 0 /* SessionReplayState.OFF */,
            };
        },
        expire: sessionManager.expire,
        expireObservable: sessionManager.expireObservable,
        setForcedReplay: function () { return sessionManager.updateSessionState({ forcedReplay: '1' }); },
    };
}
/**
 * Start a tracked replay session stub
 */
export function startRumSessionManagerStub() {
    var session = {
        id: '00000000-aaaa-0000-aaaa-000000000000',
        sessionReplay: bridgeSupports("records" /* BridgeCapability.RECORDS */) ? 1 /* SessionReplayState.SAMPLED */ : 0 /* SessionReplayState.OFF */,
    };
    return {
        findTrackedSession: function () { return session; },
        expire: noop,
        expireObservable: new Observable(),
        setForcedReplay: noop,
    };
}
function computeSessionState(configuration, rawTrackingType) {
    var trackingType;
    if (hasValidRumSession(rawTrackingType)) {
        trackingType = rawTrackingType;
    }
    else if (!performDraw(configuration.sessionSampleRate)) {
        trackingType = "0" /* RumTrackingType.NOT_TRACKED */;
    }
    else if (!performDraw(configuration.sessionReplaySampleRate)) {
        trackingType = "2" /* RumTrackingType.TRACKED_WITHOUT_SESSION_REPLAY */;
    }
    else {
        trackingType = "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */;
    }
    return {
        trackingType: trackingType,
        isTracked: isTypeTracked(trackingType),
    };
}
function hasValidRumSession(trackingType) {
    return (trackingType === "0" /* RumTrackingType.NOT_TRACKED */ ||
        trackingType === "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */ ||
        trackingType === "2" /* RumTrackingType.TRACKED_WITHOUT_SESSION_REPLAY */);
}
function isTypeTracked(rumSessionType) {
    return (rumSessionType === "2" /* RumTrackingType.TRACKED_WITHOUT_SESSION_REPLAY */ ||
        rumSessionType === "1" /* RumTrackingType.TRACKED_WITH_SESSION_REPLAY */);
}
//# sourceMappingURL=rumSessionManager.js.map