import { DOM_EVENT, addEventListeners, timeStampNow } from '@datadog/browser-core';
import { RecordType } from '../../../types';
export function trackFocus(configuration, focusCb) {
    return addEventListeners(configuration, window, [DOM_EVENT.FOCUS, DOM_EVENT.BLUR], function () {
        focusCb({
            data: { has_focus: document.hasFocus() },
            type: RecordType.Focus,
            timestamp: timeStampNow(),
        });
    });
}
//# sourceMappingURL=trackFocus.js.map