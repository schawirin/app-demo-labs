import { assign, timeStampNow } from '@datadog/browser-core';
import { RecordType } from '../../types';
export function assembleIncrementalSnapshot(source, data) {
    return {
        data: assign({
            source: source,
        }, data),
        type: RecordType.IncrementalSnapshot,
        timestamp: timeStampNow(),
    };
}
//# sourceMappingURL=assembly.js.map