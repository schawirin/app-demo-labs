"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDisplayContext = startDisplayContext;
var viewportObservable_1 = require("../../browser/viewportObservable");
function startDisplayContext(configuration) {
    var viewport = (0, viewportObservable_1.getViewportDimension)();
    var unsubscribeViewport = (0, viewportObservable_1.initViewportObservable)(configuration).subscribe(function (viewportDimension) {
        viewport = viewportDimension;
    }).unsubscribe;
    return {
        get: function () { return ({ viewport: viewport }); },
        stop: unsubscribeViewport,
    };
}
//# sourceMappingURL=displayContext.js.map