import { DOM_EVENT, throttle, addEventListener } from '@datadog/browser-core';
import { getScrollX, getScrollY, getNodePrivacyLevel, NodePrivacyLevel } from '@datadog/browser-rum-core';
import { getEventTarget } from '../eventsUtils';
import { getSerializedNodeId, hasSerializedNode } from '../serialization';
import { IncrementalSource } from '../../../types';
import { assembleIncrementalSnapshot } from '../assembly';
var SCROLL_OBSERVER_THRESHOLD = 100;
export function trackScroll(configuration, scrollCb, elementsScrollPositions, target) {
    if (target === void 0) { target = document; }
    var _a = throttle(function (event) {
        var target = getEventTarget(event);
        if (!target ||
            getNodePrivacyLevel(target, configuration.defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN ||
            !hasSerializedNode(target)) {
            return;
        }
        var id = getSerializedNodeId(target);
        var scrollPositions = target === document
            ? {
                scrollTop: getScrollY(),
                scrollLeft: getScrollX(),
            }
            : {
                scrollTop: Math.round(target.scrollTop),
                scrollLeft: Math.round(target.scrollLeft),
            };
        elementsScrollPositions.set(target, scrollPositions);
        scrollCb(assembleIncrementalSnapshot(IncrementalSource.Scroll, {
            id: id,
            x: scrollPositions.scrollLeft,
            y: scrollPositions.scrollTop,
        }));
    }, SCROLL_OBSERVER_THRESHOLD), updatePosition = _a.throttled, cancelThrottle = _a.cancel;
    var removeListener = addEventListener(configuration, target, DOM_EVENT.SCROLL, updatePosition, {
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
//# sourceMappingURL=trackScroll.js.map