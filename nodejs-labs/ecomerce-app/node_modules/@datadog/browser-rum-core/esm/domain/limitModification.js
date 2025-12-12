import { sanitize, deepClone, getType, objectEntries } from '@datadog/browser-core';
/**
 * Current limitation:
 * - field path do not support array, 'a.b.c' only
 */
export function limitModification(object, modifiableFieldPaths, modifier) {
    var clone = deepClone(object);
    var result = modifier(clone);
    objectEntries(modifiableFieldPaths).forEach(function (_a) {
        var fieldPath = _a[0], fieldType = _a[1];
        var newValue = get(clone, fieldPath);
        var newType = getType(newValue);
        if (newType === fieldType) {
            set(object, fieldPath, sanitize(newValue));
        }
        else if (fieldType === 'object' && (newType === 'undefined' || newType === 'null')) {
            set(object, fieldPath, {});
        }
    });
    return result;
}
function get(object, path) {
    var current = object;
    for (var _i = 0, _a = path.split('.'); _i < _a.length; _i++) {
        var field = _a[_i];
        if (!isValidObjectContaining(current, field)) {
            return;
        }
        current = current[field];
    }
    return current;
}
function set(object, path, value) {
    var current = object;
    var fields = path.split('.');
    for (var i = 0; i < fields.length; i += 1) {
        var field = fields[i];
        if (!isValidObject(current)) {
            return;
        }
        if (i !== fields.length - 1) {
            current = current[field];
        }
        else {
            current[field] = value;
        }
    }
}
function isValidObject(object) {
    return getType(object) === 'object';
}
function isValidObjectContaining(object, field) {
    return isValidObject(object) && Object.prototype.hasOwnProperty.call(object, field);
}
//# sourceMappingURL=limitModification.js.map