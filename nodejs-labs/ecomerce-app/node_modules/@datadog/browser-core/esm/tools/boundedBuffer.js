import { removeItem } from './utils/arrayUtils';
var BUFFER_LIMIT = 500;
var BoundedBuffer = /** @class */ (function () {
    function BoundedBuffer() {
        this.buffer = [];
    }
    BoundedBuffer.prototype.add = function (callback) {
        var length = this.buffer.push(callback);
        if (length > BUFFER_LIMIT) {
            this.buffer.splice(0, 1);
        }
    };
    BoundedBuffer.prototype.remove = function (callback) {
        removeItem(this.buffer, callback);
    };
    BoundedBuffer.prototype.drain = function (arg) {
        this.buffer.forEach(function (callback) { return callback(arg); });
        this.buffer.length = 0;
    };
    return BoundedBuffer;
}());
export { BoundedBuffer };
//# sourceMappingURL=boundedBuffer.js.map