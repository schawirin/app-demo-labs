import { DOM_EVENT, addEventListeners } from '@datadog/browser-core';
import { NodePrivacyLevel, getNodePrivacyLevel } from '@datadog/browser-rum-core';
import { IncrementalSource, MediaInteractionType } from '../../../types';
import { getEventTarget } from '../eventsUtils';
import { getSerializedNodeId, hasSerializedNode } from '../serialization';
import { assembleIncrementalSnapshot } from '../assembly';
export function trackMediaInteraction(configuration, mediaInteractionCb) {
    return addEventListeners(configuration, document, [DOM_EVENT.PLAY, DOM_EVENT.PAUSE], function (event) {
        var target = getEventTarget(event);
        if (!target ||
            getNodePrivacyLevel(target, configuration.defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN ||
            !hasSerializedNode(target)) {
            return;
        }
        mediaInteractionCb(assembleIncrementalSnapshot(IncrementalSource.MediaInteraction, {
            id: getSerializedNodeId(target),
            type: event.type === DOM_EVENT.PLAY ? MediaInteractionType.Play : MediaInteractionType.Pause,
        }));
    }, {
        capture: true,
        passive: true,
    });
}
//# sourceMappingURL=trackMediaInteraction.js.map