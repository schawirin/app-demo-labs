"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackMove = trackMove;
exports.tryToComputeCoordinates = tryToComputeCoordinates;
var browser_core_1 = require("@datadog/browser-core");
var serialization_1 = require("../serialization");
var types_1 = require("../../../types");
var eventsUtils_1 = require("../eventsUtils");
var viewports_1 = require("../viewports");
var assembly_1 = require("../assembly");
var MOUSE_MOVE_OBSERVER_THRESHOLD = 50;
function trackMove(configuration, moveCb) {
    var _a = (0, browser_core_1.throttle)(function (event) {
        var target = (0, eventsUtils_1.getEventTarget)(event);
        if ((0, serialization_1.hasSerializedNode)(target)) {
            var coordinates = tryToComputeCoordinates(event);
            if (!coordinates) {
                return;
            }
            var position = {
                id: (0, serialization_1.getSerializedNodeId)(target),
                timeOffset: 0,
                x: coordinates.x,
                y: coordinates.y,
            };
            moveCb((0, assembly_1.assembleIncrementalSnapshot)((0, eventsUtils_1.isTouchEvent)(event) ? types_1.IncrementalSource.TouchMove : types_1.IncrementalSource.MouseMove, { positions: [position] }));
        }
    }, MOUSE_MOVE_OBSERVER_THRESHOLD, {
        trailing: false,
    }), updatePosition = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = (0, browser_core_1.addEventListeners)(configuration, document, [browser_core_1.DOM_EVENT.MOUSE_MOVE, browser_core_1.DOM_EVENT.TOUCH_MOVE], updatePosition, {
        capture: true,
        passive: true,
    }).stop;
    return {
        stop: function () {
            removeListener();
            cancelThrottle();
        },
    };
}
function tryToComputeCoordinates(event) {
    var _a = (0, eventsUtils_1.isTouchEvent)(event) ? event.changedTouches[0] : event, x = _a.clientX, y = _a.clientY;
    if (window.visualViewport) {
        var _b = (0, viewports_1.convertMouseEventToLayoutCoordinates)(x, y), visualViewportX = _b.visualViewportX, visualViewportY = _b.visualViewportY;
        x = visualViewportX;
        y = visualViewportY;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        if (event.isTrusted) {
            (0, browser_core_1.addTelemetryDebug)('mouse/touch event without x/y');
        }
        return undefined;
    }
    return { x: x, y: y };
}
//# sourceMappingURL=trackMove.js.map