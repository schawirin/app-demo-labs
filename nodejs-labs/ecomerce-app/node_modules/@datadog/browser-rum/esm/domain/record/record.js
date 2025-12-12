import { sendToExtension } from '@datadog/browser-core';
import * as replayStats from '../replayStats';
import { trackFocus, trackFrustration, trackInput, trackMediaInteraction, trackMouseInteraction, trackMove, trackMutation, trackScroll, trackStyleSheet, trackViewEnd, trackViewportResize, } from './trackers';
import { createElementsScrollPositions } from './elementsScrollPositions';
import { initShadowRootsController } from './shadowRootsController';
import { startFullSnapshots } from './startFullSnapshots';
import { initRecordIds } from './recordIds';
export function record(options) {
    var emit = options.emit, configuration = options.configuration, lifeCycle = options.lifeCycle;
    // runtime checks for user options
    if (!emit) {
        throw new Error('emit function is required');
    }
    var emitAndComputeStats = function (record) {
        emit(record);
        sendToExtension('record', { record: record });
        var view = options.viewContexts.findView();
        replayStats.addRecord(view.id);
    };
    var elementsScrollPositions = createElementsScrollPositions();
    var shadowRootsController = initShadowRootsController(configuration, emitAndComputeStats, elementsScrollPositions);
    var stopFullSnapshots = startFullSnapshots(elementsScrollPositions, shadowRootsController, lifeCycle, configuration, flushMutations, function (records) { return records.forEach(function (record) { return emitAndComputeStats(record); }); }).stop;
    function flushMutations() {
        shadowRootsController.flush();
        mutationTracker.flush();
    }
    var recordIds = initRecordIds();
    var mutationTracker = trackMutation(emitAndComputeStats, configuration, shadowRootsController, document);
    var trackers = [
        mutationTracker,
        trackMove(configuration, emitAndComputeStats),
        trackMouseInteraction(configuration, emitAndComputeStats, recordIds),
        trackScroll(configuration, emitAndComputeStats, elementsScrollPositions, document),
        trackViewportResize(configuration, emitAndComputeStats),
        trackInput(configuration, emitAndComputeStats),
        trackMediaInteraction(configuration, emitAndComputeStats),
        trackStyleSheet(emitAndComputeStats),
        trackFocus(configuration, emitAndComputeStats),
        trackViewportResize(configuration, emitAndComputeStats),
        trackFrustration(lifeCycle, emitAndComputeStats, recordIds),
        trackViewEnd(lifeCycle, function (viewEndRecord) {
            flushMutations();
            emitAndComputeStats(viewEndRecord);
        }),
    ];
    return {
        stop: function () {
            shadowRootsController.stop();
            trackers.forEach(function (tracker) { return tracker.stop(); });
            stopFullSnapshots();
        },
        flushMutations: flushMutations,
        shadowRootsController: shadowRootsController,
    };
}
//# sourceMappingURL=record.js.map