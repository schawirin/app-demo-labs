"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRecorderApi = makeRecorderApi;
var browser_core_1 = require("@datadog/browser-core");
var replayStats_1 = require("../domain/replayStats");
var getSessionReplayLink_1 = require("../domain/getSessionReplayLink");
var deflate_1 = require("../domain/deflate");
var isBrowserSupported_1 = require("./isBrowserSupported");
function makeRecorderApi(startRecordingImpl, createDeflateWorkerImpl) {
    if (((0, browser_core_1.canUseEventBridge)() && !(0, browser_core_1.bridgeSupports)("records" /* BridgeCapability.RECORDS */)) || !(0, isBrowserSupported_1.isBrowserSupported)()) {
        return {
            start: browser_core_1.noop,
            stop: browser_core_1.noop,
            getReplayStats: function () { return undefined; },
            onRumStart: browser_core_1.noop,
            isRecording: function () { return false; },
            getSessionReplayLink: function () { return undefined; },
        };
    }
    var state = {
        status: 1 /* RecorderStatus.IntentToStart */,
    };
    var startStrategy = function () {
        state = { status: 1 /* RecorderStatus.IntentToStart */ };
    };
    var stopStrategy = function () {
        state = { status: 0 /* RecorderStatus.Stopped */ };
    };
    var getSessionReplayLinkStrategy = browser_core_1.noop;
    return {
        start: function (options) { return startStrategy(options); },
        stop: function () { return stopStrategy(); },
        getSessionReplayLink: function () { return getSessionReplayLinkStrategy(); },
        onRumStart: function (lifeCycle, configuration, sessionManager, viewContexts, worker) {
            if (configuration.startSessionReplayRecordingManually) {
                state = { status: 0 /* RecorderStatus.Stopped */ };
            }
            lifeCycle.subscribe(9 /* LifeCycleEventType.SESSION_EXPIRED */, function () {
                if (state.status === 2 /* RecorderStatus.Starting */ || state.status === 3 /* RecorderStatus.Started */) {
                    stopStrategy();
                    state = { status: 1 /* RecorderStatus.IntentToStart */ };
                }
            });
            // Stop the recorder on page unload to avoid sending records after the page is ended.
            lifeCycle.subscribe(11 /* LifeCycleEventType.PAGE_EXITED */, function (pageExitEvent) {
                if (pageExitEvent.reason === browser_core_1.PageExitReason.UNLOADING) {
                    stopStrategy();
                }
            });
            lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, function () {
                if (state.status === 1 /* RecorderStatus.IntentToStart */) {
                    startStrategy();
                }
            });
            var cachedDeflateEncoder;
            function getOrCreateDeflateEncoder() {
                if (!cachedDeflateEncoder) {
                    if (!worker) {
                        worker = (0, deflate_1.startDeflateWorker)(configuration, 'Datadog Session Replay', function () {
                            stopStrategy();
                        }, createDeflateWorkerImpl);
                    }
                    if (worker) {
                        cachedDeflateEncoder = (0, deflate_1.createDeflateEncoder)(configuration, worker, 1 /* DeflateEncoderStreamId.REPLAY */);
                    }
                }
                return cachedDeflateEncoder;
            }
            startStrategy = function (options) {
                var session = sessionManager.findTrackedSession();
                if (!session || (session.sessionReplay === 0 /* SessionReplayState.OFF */ && !(options === null || options === void 0 ? void 0 : options.force))) {
                    state = { status: 1 /* RecorderStatus.IntentToStart */ };
                    return;
                }
                if (state.status === 2 /* RecorderStatus.Starting */ || state.status === 3 /* RecorderStatus.Started */) {
                    return;
                }
                state = { status: 2 /* RecorderStatus.Starting */ };
                (0, browser_core_1.runOnReadyState)(configuration, 'interactive', function () {
                    if (state.status !== 2 /* RecorderStatus.Starting */) {
                        return;
                    }
                    var deflateEncoder = getOrCreateDeflateEncoder();
                    if (!deflateEncoder) {
                        state = {
                            status: 0 /* RecorderStatus.Stopped */,
                        };
                        return;
                    }
                    var stopRecording = startRecordingImpl(lifeCycle, configuration, sessionManager, viewContexts, deflateEncoder).stop;
                    state = {
                        status: 3 /* RecorderStatus.Started */,
                        stopRecording: stopRecording,
                    };
                });
                if ((options === null || options === void 0 ? void 0 : options.force) && session.sessionReplay === 0 /* SessionReplayState.OFF */) {
                    sessionManager.setForcedReplay();
                }
            };
            stopStrategy = function () {
                if (state.status === 0 /* RecorderStatus.Stopped */) {
                    return;
                }
                if (state.status === 3 /* RecorderStatus.Started */) {
                    state.stopRecording();
                }
                state = {
                    status: 0 /* RecorderStatus.Stopped */,
                };
            };
            getSessionReplayLinkStrategy = function () {
                return (0, getSessionReplayLink_1.getSessionReplayLink)(configuration, sessionManager, viewContexts, state.status !== 0 /* RecorderStatus.Stopped */);
            };
            if (state.status === 1 /* RecorderStatus.IntentToStart */) {
                startStrategy();
            }
        },
        isRecording: function () {
            // The worker is started optimistically, meaning we could have started to record but its
            // initialization fails a bit later. This could happen when:
            // * the worker URL (blob or plain URL) is blocked by CSP in Firefox only (Chromium and Safari
            // throw an exception when instantiating the worker, and IE doesn't care about CSP)
            // * the browser fails to load the worker in case the workerUrl is used
            // * an unexpected error occurs in the Worker before initialization, ex:
            //   * a runtime exception collected by monitor()
            //   * a syntax error notified by the browser via an error event
            // * the worker is unresponsive for some reason and timeouts
            //
            // It is not expected to happen often. Nonetheless, the "replayable" status on RUM events is
            // an important part of the Datadog App:
            // * If we have a false positive (we set has_replay: true even if no replay data is present),
            // we might display broken links to the Session Replay player.
            // * If we have a false negative (we don't set has_replay: true even if replay data is
            // available), it is less noticeable because no link will be displayed.
            //
            // Thus, it is better to have false negative, so let's make sure the worker is correctly
            // initialized before advertizing that we are recording.
            //
            // In the future, when the compression worker will also be used for RUM data, this will be
            // less important since no RUM event will be sent when the worker fails to initialize.
            return (0, deflate_1.getDeflateWorkerStatus)() === 3 /* DeflateWorkerStatus.Initialized */ && state.status === 3 /* RecorderStatus.Started */;
        },
        getReplayStats: function (viewId) {
            return (0, deflate_1.getDeflateWorkerStatus)() === 3 /* DeflateWorkerStatus.Initialized */ ? (0, replayStats_1.getReplayStats)(viewId) : undefined;
        },
    };
}
//# sourceMappingURL=recorderApi.js.map