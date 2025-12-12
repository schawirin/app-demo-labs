"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOM_EVENT = void 0;
exports.addEventListener = addEventListener;
exports.addEventListeners = addEventListeners;
var monitor_1 = require("../tools/monitor");
var getZoneJsOriginalValue_1 = require("../tools/getZoneJsOriginalValue");
// We want to use a real enum (i.e. not a const enum) here, to be able to iterate over it to automatically add _ddIsTrusted in e2e tests
// eslint-disable-next-line no-restricted-syntax
var DOM_EVENT;
(function (DOM_EVENT) {
    DOM_EVENT["BEFORE_UNLOAD"] = "beforeunload";
    DOM_EVENT["CLICK"] = "click";
    DOM_EVENT["DBL_CLICK"] = "dblclick";
    DOM_EVENT["KEY_DOWN"] = "keydown";
    DOM_EVENT["LOAD"] = "load";
    DOM_EVENT["POP_STATE"] = "popstate";
    DOM_EVENT["SCROLL"] = "scroll";
    DOM_EVENT["TOUCH_START"] = "touchstart";
    DOM_EVENT["TOUCH_END"] = "touchend";
    DOM_EVENT["TOUCH_MOVE"] = "touchmove";
    DOM_EVENT["VISIBILITY_CHANGE"] = "visibilitychange";
    DOM_EVENT["PAGE_SHOW"] = "pageshow";
    DOM_EVENT["FREEZE"] = "freeze";
    DOM_EVENT["RESUME"] = "resume";
    DOM_EVENT["DOM_CONTENT_LOADED"] = "DOMContentLoaded";
    DOM_EVENT["POINTER_DOWN"] = "pointerdown";
    DOM_EVENT["POINTER_UP"] = "pointerup";
    DOM_EVENT["POINTER_CANCEL"] = "pointercancel";
    DOM_EVENT["HASH_CHANGE"] = "hashchange";
    DOM_EVENT["PAGE_HIDE"] = "pagehide";
    DOM_EVENT["MOUSE_DOWN"] = "mousedown";
    DOM_EVENT["MOUSE_UP"] = "mouseup";
    DOM_EVENT["MOUSE_MOVE"] = "mousemove";
    DOM_EVENT["FOCUS"] = "focus";
    DOM_EVENT["BLUR"] = "blur";
    DOM_EVENT["CONTEXT_MENU"] = "contextmenu";
    DOM_EVENT["RESIZE"] = "resize";
    DOM_EVENT["CHANGE"] = "change";
    DOM_EVENT["INPUT"] = "input";
    DOM_EVENT["PLAY"] = "play";
    DOM_EVENT["PAUSE"] = "pause";
    DOM_EVENT["SECURITY_POLICY_VIOLATION"] = "securitypolicyviolation";
    DOM_EVENT["SELECTION_CHANGE"] = "selectionchange";
    DOM_EVENT["STORAGE"] = "storage";
})(DOM_EVENT || (exports.DOM_EVENT = DOM_EVENT = {}));
/**
 * Add an event listener to an event target object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 */
function addEventListener(configuration, eventTarget, eventName, listener, options) {
    return addEventListeners(configuration, eventTarget, [eventName], listener, options);
}
/**
 * Add event listeners to an event target object (Window, Element, mock object...).  This provides
 * a few conveniences compared to using `element.addEventListener` directly:
 *
 * * supports IE11 by: using an option object only if needed and emulating the `once` option
 *
 * * wraps the listener with a `monitor` function
 *
 * * returns a `stop` function to remove the listener
 *
 * * with `once: true`, the listener will be called at most once, even if different events are listened
 */
function addEventListeners(configuration, eventTarget, eventNames, listener, _a) {
    var _b = _a === void 0 ? {} : _a, once = _b.once, capture = _b.capture, passive = _b.passive;
    var listenerWithMonitor = (0, monitor_1.monitor)(function (event) {
        if (!event.isTrusted && !event.__ddIsTrusted && !configuration.allowUntrustedEvents) {
            return;
        }
        if (once) {
            stop();
        }
        listener(event);
    });
    var options = passive ? { capture: capture, passive: passive } : capture;
    var add = (0, getZoneJsOriginalValue_1.getZoneJsOriginalValue)(eventTarget, 'addEventListener');
    eventNames.forEach(function (eventName) { return add.call(eventTarget, eventName, listenerWithMonitor, options); });
    function stop() {
        var remove = (0, getZoneJsOriginalValue_1.getZoneJsOriginalValue)(eventTarget, 'removeEventListener');
        eventNames.forEach(function (eventName) { return remove.call(eventTarget, eventName, listenerWithMonitor, options); });
    }
    return {
        stop: stop,
    };
}
//# sourceMappingURL=addEventListener.js.map