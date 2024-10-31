"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.record = record;
var browser_core_1 = require("@datadog/browser-core");
var replayStats = __importStar(require("../replayStats"));
var trackers_1 = require("./trackers");
var elementsScrollPositions_1 = require("./elementsScrollPositions");
var shadowRootsController_1 = require("./shadowRootsController");
var startFullSnapshots_1 = require("./startFullSnapshots");
var recordIds_1 = require("./recordIds");
function record(options) {
    var emit = options.emit, configuration = options.configuration, lifeCycle = options.lifeCycle;
    // runtime checks for user options
    if (!emit) {
        throw new Error('emit function is required');
    }
    var emitAndComputeStats = function (record) {
        emit(record);
        (0, browser_core_1.sendToExtension)('record', { record: record });
        var view = options.viewContexts.findView();
        replayStats.addRecord(view.id);
    };
    var elementsScrollPositions = (0, elementsScrollPositions_1.createElementsScrollPositions)();
    var shadowRootsController = (0, shadowRootsController_1.initShadowRootsController)(configuration, emitAndComputeStats, elementsScrollPositions);
    var stopFullSnapshots = (0, startFullSnapshots_1.startFullSnapshots)(elementsScrollPositions, shadowRootsController, lifeCycle, configuration, flushMutations, function (records) { return records.forEach(function (record) { return emitAndComputeStats(record); }); }).stop;
    function flushMutations() {
        shadowRootsController.flush();
        mutationTracker.flush();
    }
    var recordIds = (0, recordIds_1.initRecordIds)();
    var mutationTracker = (0, trackers_1.trackMutation)(emitAndComputeStats, configuration, shadowRootsController, document);
    var trackers = [
        mutationTracker,
        (0, trackers_1.trackMove)(configuration, emitAndComputeStats),
        (0, trackers_1.trackMouseInteraction)(configuration, emitAndComputeStats, recordIds),
        (0, trackers_1.trackScroll)(configuration, emitAndComputeStats, elementsScrollPositions, document),
        (0, trackers_1.trackViewportResize)(configuration, emitAndComputeStats),
        (0, trackers_1.trackInput)(configuration, emitAndComputeStats),
        (0, trackers_1.trackMediaInteraction)(configuration, emitAndComputeStats),
        (0, trackers_1.trackStyleSheet)(emitAndComputeStats),
        (0, trackers_1.trackFocus)(configuration, emitAndComputeStats),
        (0, trackers_1.trackViewportResize)(configuration, emitAndComputeStats),
        (0, trackers_1.trackFrustration)(lifeCycle, emitAndComputeStats, recordIds),
        (0, trackers_1.trackViewEnd)(lifeCycle, function (viewEndRecord) {
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