import { instrumentSetter, assign, DOM_EVENT, addEventListeners, forEach, noop } from '@datadog/browser-core';
import { NodePrivacyLevel, getNodePrivacyLevel, shouldMaskNode, cssEscape } from '@datadog/browser-rum-core';
import { IncrementalSource } from '../../../types';
import { getEventTarget } from '../eventsUtils';
import { getElementInputValue, getSerializedNodeId, hasSerializedNode } from '../serialization';
import { assembleIncrementalSnapshot } from '../assembly';
export function trackInput(configuration, inputCb, target) {
    if (target === void 0) { target = document; }
    var defaultPrivacyLevel = configuration.defaultPrivacyLevel;
    var lastInputStateMap = new WeakMap();
    var isShadowRoot = target !== document;
    var stopEventListeners = addEventListeners(configuration, target, 
    // The 'input' event bubbles across shadow roots, so we don't have to listen for it on shadow
    // roots since it will be handled by the event listener that we did add to the document. Only
    // the 'change' event is blocked and needs to be handled on shadow roots.
    isShadowRoot ? [DOM_EVENT.CHANGE] : [DOM_EVENT.INPUT, DOM_EVENT.CHANGE], function (event) {
        var target = getEventTarget(event);
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
            instrumentSetter(HTMLInputElement.prototype, 'value', onElementChange),
            instrumentSetter(HTMLInputElement.prototype, 'checked', onElementChange),
            instrumentSetter(HTMLSelectElement.prototype, 'value', onElementChange),
            instrumentSetter(HTMLTextAreaElement.prototype, 'value', onElementChange),
            instrumentSetter(HTMLSelectElement.prototype, 'selectedIndex', onElementChange),
        ];
        stopPropertySetterInstrumentation = function () {
            instrumentationStoppers_1.forEach(function (stopper) { return stopper.stop(); });
        };
    }
    else {
        stopPropertySetterInstrumentation = noop;
    }
    return {
        stop: function () {
            stopPropertySetterInstrumentation();
            stopEventListeners();
        },
    };
    function onElementChange(target) {
        var nodePrivacyLevel = getNodePrivacyLevel(target, defaultPrivacyLevel);
        if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
            return;
        }
        var type = target.type;
        var inputState;
        if (type === 'radio' || type === 'checkbox') {
            if (shouldMaskNode(target, nodePrivacyLevel)) {
                return;
            }
            inputState = { isChecked: target.checked };
        }
        else {
            var value = getElementInputValue(target, nodePrivacyLevel);
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
            forEach(document.querySelectorAll("input[type=\"radio\"][name=\"".concat(cssEscape(name), "\"]")), function (el) {
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
        if (!hasSerializedNode(target)) {
            return;
        }
        var lastInputState = lastInputStateMap.get(target);
        if (!lastInputState ||
            lastInputState.text !== inputState.text ||
            lastInputState.isChecked !== inputState.isChecked) {
            lastInputStateMap.set(target, inputState);
            inputCb(assembleIncrementalSnapshot(IncrementalSource.Input, assign({
                id: getSerializedNodeId(target),
            }, inputState)));
        }
    }
}
//# sourceMappingURL=trackInput.js.map