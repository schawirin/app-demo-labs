"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFullSnapshots = startFullSnapshots;
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var browser_core_1 = require("@datadog/browser-core");
var types_1 = require("../../types");
var serialization_1 = require("./serialization");
var viewports_1 = require("./viewports");
function startFullSnapshots(elementsScrollPositions, shadowRootsController, lifeCycle, configuration, flushMutations, fullSnapshotCallback) {
    var takeFullSnapshot = function (timestamp, serializationContext) {
        if (timestamp === void 0) { timestamp = (0, browser_core_1.timeStampNow)(); }
        if (serializationContext === void 0) { serializationContext = {
            status: 0 /* SerializationContextStatus.INITIAL_FULL_SNAPSHOT */,
            elementsScrollPositions: elementsScrollPositions,
            shadowRootsController: shadowRootsController,
        }; }
        var _a = (0, browser_rum_core_1.getViewportDimension)(), width = _a.width, height = _a.height;
        var records = [
            {
                data: {
                    height: height,
                    href: window.location.href,
                    width: width,
                },
                type: types_1.RecordType.Meta,
                timestamp: timestamp,
            },
            {
                data: {
                    has_focus: document.hasFocus(),
                },
                type: types_1.RecordType.Focus,
                timestamp: timestamp,
            },
            {
                data: {
                    node: (0, serialization_1.serializeDocument)(document, configuration, serializationContext),
                    initialOffset: {
                        left: (0, browser_rum_core_1.getScrollX)(),
                        top: (0, browser_rum_core_1.getScrollY)(),
                    },
                },
                type: types_1.RecordType.FullSnapshot,
                timestamp: timestamp,
            },
        ];
        if (window.visualViewport) {
            records.push({
                data: (0, viewports_1.getVisualViewport)(window.visualViewport),
                type: types_1.RecordType.VisualViewport,
                timestamp: timestamp,
            });
        }
        return records;
    };
    fullSnapshotCallback(takeFullSnapshot());
    var unsubscribe = lifeCycle.subscribe(3 /* LifeCycleEventType.VIEW_CREATED */, function (view) {
        flushMutations();
        fullSnapshotCallback(takeFullSnapshot(view.startClocks.timeStamp, {
            shadowRootsController: shadowRootsController,
            status: 1 /* SerializationContextStatus.SUBSEQUENT_FULL_SNAPSHOT */,
            elementsScrollPositions: elementsScrollPositions,
        }));
    }).unsubscribe;
    return {
        stop: unsubscribe,
    };
}
//# sourceMappingURL=startFullSnapshots.js.map