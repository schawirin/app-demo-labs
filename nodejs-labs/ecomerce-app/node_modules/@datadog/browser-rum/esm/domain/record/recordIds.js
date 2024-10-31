export function initRecordIds() {
    var recordIds = new WeakMap();
    var nextId = 1;
    return {
        getIdForEvent: function (event) {
            if (!recordIds.has(event)) {
                recordIds.set(event, nextId++);
            }
            return recordIds.get(event);
        },
    };
}
//# sourceMappingURL=recordIds.js.map