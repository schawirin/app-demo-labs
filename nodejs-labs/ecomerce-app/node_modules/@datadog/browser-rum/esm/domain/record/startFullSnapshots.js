import { getScrollX, getScrollY, getViewportDimension } from '@datadog/browser-rum-core';
import { timeStampNow } from '@datadog/browser-core';
import { RecordType } from '../../types';
import { serializeDocument } from './serialization';
import { getVisualViewport } from './viewports';
export function startFullSnapshots(elementsScrollPositions, shadowRootsController, lifeCycle, configuration, flushMutations, fullSnapshotCallback) {
    var takeFullSnapshot = function (timestamp, serializationContext) {
        if (timestamp === void 0) { timestamp = timeStampNow(); }
        if (serializationContext === void 0) { serializationContext = {
            status: 0 /* SerializationContextStatus.INITIAL_FULL_SNAPSHOT */,
            elementsScrollPositions: elementsScrollPositions,
            shadowRootsController: shadowRootsController,
        }; }
        var _a = getViewportDimension(), width = _a.width, height = _a.height;
        var records = [
            {
                data: {
                    height: height,
                    href: window.location.href,
                    width: width,
                },
                type: RecordType.Meta,
                timestamp: timestamp,
            },
            {
                data: {
                    has_focus: document.hasFocus(),
                },
                type: RecordType.Focus,
                timestamp: timestamp,
            },
            {
                data: {
                    node: serializeDocument(document, configuration, serializationContext),
                    initialOffset: {
                        left: getScrollX(),
                        top: getScrollY(),
                    },
                },
                type: RecordType.FullSnapshot,
                timestamp: timestamp,
            },
        ];
        if (window.visualViewport) {
            records.push({
                data: getVisualViewport(window.visualViewport),
                type: RecordType.VisualViewport,
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