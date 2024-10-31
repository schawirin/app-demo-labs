"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackInput = trackInput;
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var types_1 = require("../../../types");
var eventsUtils_1 = require("../eventsUtils");
var serialization_1 = require("../serialization");
var assembly_1 = require("../assembly");
function trackInput(configuration, inputCb, target) {
    if (target === void 0) { target = document; }
    var defaultPrivacyLevel = configuration.defaultPrivacyLevel;
    var lastInputStateMap = new WeakMap();
    var isShadowRoot = target !== document;
    var stopEventListeners = (0, browser_core_1.addEventListeners)(configuration, target, 
    // The 'input' event bubbles across shadow roots, so we don't have to listen for it on shadow
    // roots since it will be handled by the event listener that we did add to the document. Only
    // the 'change' event is blocked and needs to be handled on shadow roots.
    isShadowRoot ? [browser_core_1.DOM_EVENT.CHANGE] : [browser_core_1.DOM_EVENT.INPUT, browser_core_1.DOM_EVENT.CHANGE], function (event) {
        var target = (0, eventsUtils_1.getEventTarget)(event);
        if (target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement) {
            onElementChange(target);
        }
    }, {
        capture: true,
        passive: true,
    }).stop;
    var stopPropertySetterInstrumentation;
    if (!isShadowRoot) {
        var instrumentationStoppers_1 = [
            (0, browser_core_1.instrumentSetter)(HTMLInputElement.prototype, 'value', onElementChange),
            (0, browser_core_1.instrumentSetter)(HTMLInputElement.prototype, 'checked', onElementChange),
            (0, browser_core_1.instrumentSetter)(HTMLSelectElement.prototype, 'value', onElementChange),
            (0, browser_core_1.instrumentSetter)(HTMLTextAreaElement.prototype, 'value', onElementChange),
            (0, browser_core_1.instrumentSetter)(HTMLSelectElement.prototype, 'selectedIndex', onElementChange),
        ];
        stopPropertySetterInstrumentation = function () {
            instrumentationStoppers_1.forEach(function (stopper) { return stopper.stop(); });
        };
    }
    else {
        stopPropertySetterInstrumentation = browser_core_1.noop;
    }
    return {
        stop: function () {
            stopPropertySetterInstrumentation();
            stopEventListeners();
        },
    };
    function onElementChange(target) {
        var nodePrivacyLevel = (0, browser_rum_core_1.getNodePrivacyLevel)(target, defaultPrivacyLevel);
        if (nodePrivacyLevel === browser_rum_core_1.NodePrivacyLevel.HIDDEN) {
            return;
        }
        var type = target.type;
        var inputState;
        if (type === 'radio' || type === 'checkbox') {
            if ((0, browser_rum_core_1.shouldMaskNode)(target, nodePrivacyLevel)) {
                return;
            }
            inputState = { isChecked: target.checked };
        }
        else {
            var value = (0, serialization_1.getElementInputValue)(target, nodePrivacyLevel);
            if (value === undefined) {
                return;
            }
            inputState = { text: value };
        }
        // Can be multiple changes on the same node within the same batched mutation observation.
        cbWithDedup(target, inputState);
        // If a radio was checked, other radios with the same name attribute will be unchecked.
        var name = target.name;
        if (type === 'radio' && name && target.checked) {
            (0, browser_core_1.forEach)(document.querySelectorAll("input[type=\"radio\"][name=\"".concat((0, browser_rum_core_1.cssEscape)(name), "\"]")), function (el) {
                if (el !== target) {
                    // TODO: Consider the privacy implications for various differing input privacy levels
                    cbWithDedup(el, { isChecked: false });
                }
            });
        }
    }
    /**
     * There can be multiple changes on the same node within the same batched mutation observation.
     */
    function cbWithDedup(target, inputState) {
        if (!(0, serialization_1.hasSerializedNode)(target)) {
            return;
        }
        var lastInputState = lastInputStateMap.get(target);
        if (!lastInputState ||
            lastInputState.text !== inputState.text ||
            lastInputState.isChecked !== inputState.isChecked) {
            lastInputStateMap.set(target, inputState);
            inputCb((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.Input, (0, browser_core_1.assign)({
                id: (0, serialization_1.getSerializedNodeId)(target),
            }, inputState)));
        }
    }
}
//# sourceMappingURL=trackInput.js.map