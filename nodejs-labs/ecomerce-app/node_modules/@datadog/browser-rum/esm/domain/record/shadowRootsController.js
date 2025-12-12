import { trackInput, trackMutation, trackScroll } from './trackers';
export var initShadowRootsController = function (configuration, callback, elementsScrollPositions) {
    var controllerByShadowRoot = new Map();
    var shadowRootsController = {
        addShadowRoot: function (shadowRoot) {
            if (controllerByShadowRoot.has(shadowRoot)) {
                return;
            }
            var mutationTracker = trackMutation(callback, configuration, shadowRootsController, shadowRoot);
            // The change event does not bubble up across the shadow root, we have to listen on the shadow root
            var inputTracker = trackInput(configuration, callback, shadowRoot);
            // The scroll event does not bubble up across the shadow root, we have to listen on the shadow root
            var scrollTracker = trackScroll(configuration, callback, elementsScrollPositions, shadowRoot);
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
//# sourceMappingURL=shadowRootsController.js.map