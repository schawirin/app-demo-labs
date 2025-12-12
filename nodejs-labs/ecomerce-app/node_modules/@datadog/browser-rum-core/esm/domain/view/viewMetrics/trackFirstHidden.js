import { addEventListeners, DOM_EVENT } from '@datadog/browser-core';
export function trackFirstHidden(configuration, eventTarget) {
    if (eventTarget === void 0) { eventTarget = window; }
    var timeStamp;
    var stopListeners;
    if (document.visibilityState === 'hidden') {
        timeStamp = 0;
    }
    else {
        timeStamp = Infinity;
        (stopListeners = addEventListeners(configuration, eventTarget, [DOM_EVENT.PAGE_HIDE, DOM_EVENT.VISIBILITY_CHANGE], function (event) {
            if (event.type === DOM_EVENT.PAGE_HIDE || document.visibilityState === 'hidden') {
                timeStamp = event.timeStamp;
                stopListeners();
            }
        }, { capture: true }).stop);
    }
    return {
        get timeStamp() {
            return timeStamp;
        },
        stop: function () {
            stopListeners === null || stopListeners === void 0 ? void 0 : stopListeners();
        },
    };
}
//# sourceMappingURL=trackFirstHidden.js.map