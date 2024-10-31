"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initShadowRootsController = void 0;
var trackers_1 = require("./trackers");
var initShadowRootsController = function (configuration, callback, elementsScrollPositions) {
    var controllerByShadowRoot = new Map();
    var shadowRootsController = {
        addShadowRoot: function (shadowRoot) {
            if (controllerByShadowRoot.has(shadowRoot)) {
                return;
            }
            var mutationTracker = (0, trackers_1.trackMutation)(callback, configuration, shadowRootsController, shadowRoot);
            // The change event does not bubble up across the shadow root, we have to listen on the shadow root
            var inputTracker = (0, trackers_1.trackInput)(configuration, callback, shadowRoot);
            // The scroll event does not bubble up across the shadow root, we have to listen on the shadow root
            var scrollTracker = (0, trackers_1.trackScroll)(configuration, callback, elementsScrollPositions, shadowRoot);
            controllerByShadowRoot.set(shadowRoot, {
                flush: function () { return mutationTracker.flush(); },
                stop: function () {
                    mutationTracker.stop();
                    inputTracker.stop();
                    scrollTracker.stop();
                },
            });
        },
        removeShadowRoot: function (shadowRoot) {
            var entry = controllerByShadowRoot.get(shadowRoot);
            if (!entry) {
                // unidentified root cause: observed in some cases with shadow DOM added by browser extensions
                return;
            }
            entry.stop();
            controllerByShadowRoot.delete(shadowRoot);
        },
        stop: function () {
            controllerByShadowRoot.forEach(function (_a) {
                var stop = _a.stop;
                return stop();
            });
        },
        flush: function () {
            controllerByShadowRoot.forEach(function (_a) {
                var flush = _a.flush;
                return flush();
            });
        },
    };
    return shadowRootsController;
};
exports.initShadowRootsController = initShadowRootsController;
//# sourceMappingURL=shadowRootsController.js.map