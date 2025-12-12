import { canUseEventBridge, noop, runOnReadyState, PageExitReason, bridgeSupports, } from '@datadog/browser-core';
import { getReplayStats as getReplayStatsImpl } from '../domain/replayStats';
import { getSessionReplayLink } from '../domain/getSessionReplayLink';
import { createDeflateEncoder, startDeflateWorker, getDeflateWorkerStatus, } from '../domain/deflate';
import { isBrowserSupported } from './isBrowserSupported';
export function makeRecorderApi(startRecordingImpl, createDeflateWorkerImpl) {
    if ((canUseEventBridge() && !bridgeSupports("records" /* BridgeCapability.RECORDS */)) || !isBrowserSupported()) {
        return {
            start: noop,
            stop: noop,
            getReplayStats: function () { return undefined; },
            onRumStart: noop,
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
    var getSessionReplayLinkStrategy = noop;
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
                if (pageExitEvent.reason === PageExitReason.UNLOADING) {
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
                        worker = startDeflateWorker(configuration, 'Datadog Session Replay', function () {
                            stopStrategy();
                        }, createDeflateWorkerImpl);
                    }
                    if (worker) {
                        cachedDeflateEncoder = createDeflateEncoder(configuration, worker, 1 /* DeflateEncoderStreamId.REPLAY */);
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
                runOnReadyState(configuration, 'interactive', function () {
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
                return getSessionReplayLink(configuration, sessionManager, viewContexts, state.status !== 0 /* RecorderStatus.Stopped */);
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
            return getDeflateWorkerStatus() === 3 /* DeflateWorkerStatus.Initialized */ && state.status === 3 /* RecorderStatus.Started */;
        },
        getReplayStats: function (viewId) {
            return getDeflateWorkerStatus() === 3 /* DeflateWorkerStatus.Initialized */ ? getReplayStatsImpl(viewId) : undefined;
        },
    };
}
//# sourceMappingURL=recorderApi.js.map