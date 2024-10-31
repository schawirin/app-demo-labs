"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ATTRIBUTE_VALUE_CHAR_LENGTH = exports.sanitizeDataUrl = exports.isLongDataUrl = exports.getSessionReplayUrl = exports.STABLE_ATTRIBUTES = exports.DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE = exports.getScrollY = exports.getScrollX = exports.getViewportDimension = exports.initViewportObservable = exports.getMutationObserverConstructor = exports.startViewContexts = exports.LifeCycle = exports.startRum = exports.makeRumPublicApi = void 0;
var rumPublicApi_1 = require("./boot/rumPublicApi");
Object.defineProperty(exports, "makeRumPublicApi", { enumerable: true, get: function () { return rumPublicApi_1.makeRumPublicApi; } });
var startRum_1 = require("./boot/startRum");
Object.defineProperty(exports, "startRum", { enumerable: true, get: function () { return startRum_1.startRum; } });
var lifeCycle_1 = require("./domain/lifeCycle");
Object.defineProperty(exports, "LifeCycle", { enumerable: true, get: function () { return lifeCycle_1.LifeCycle; } });
var viewContexts_1 = require("./domain/contexts/viewContexts");
Object.defineProperty(exports, "startViewContexts", { enumerable: true, get: function () { return viewContexts_1.startViewContexts; } });
var domMutationObservable_1 = require("./browser/domMutationObservable");
Object.defineProperty(exports, "getMutationObserverConstructor", { enumerable: true, get: function () { return domMutationObservable_1.getMutationObserverConstructor; } });
var viewportObservable_1 = require("./browser/viewportObservable");
Object.defineProperty(exports, "initViewportObservable", { enumerable: true, get: function () { return viewportObservable_1.initViewportObservable; } });
Object.defineProperty(exports, "getViewportDimension", { enumerable: true, get: function () { return viewportObservable_1.getViewportDimension; } });
var scroll_1 = require("./browser/scroll");
Object.defineProperty(exports, "getScrollX", { enumerable: true, get: function () { return scroll_1.getScrollX; } });
Object.defineProperty(exports, "getScrollY", { enumerable: true, get: function () { return scroll_1.getScrollY; } });
var getActionNameFromElement_1 = require("./domain/action/getActionNameFromElement");
Object.defineProperty(exports, "DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE", { enumerable: true, get: function () { return getActionNameFromElement_1.DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE; } });
var getSelectorFromElement_1 = require("./domain/getSelectorFromElement");
Object.defineProperty(exports, "STABLE_ATTRIBUTES", { enumerable: true, get: function () { return getSelectorFromElement_1.STABLE_ATTRIBUTES; } });
__exportStar(require("./browser/htmlDomUtils"), exports);
__exportStar(require("./browser/polyfills"), exports);
var getSessionReplayUrl_1 = require("./domain/getSessionReplayUrl");
Object.defineProperty(exports, "getSessionReplayUrl", { enumerable: true, get: function () { return getSessionReplayUrl_1.getSessionReplayUrl; } });
var resourceUtils_1 = require("./domain/resource/resourceUtils");
Object.defineProperty(exports, "isLongDataUrl", { enumerable: true, get: function () { return resourceUtils_1.isLongDataUrl; } });
Object.defineProperty(exports, "sanitizeDataUrl", { enumerable: true, get: function () { return resourceUtils_1.sanitizeDataUrl; } });
Object.defineProperty(exports, "MAX_ATTRIBUTE_VALUE_CHAR_LENGTH", { enumerable: true, get: function () { return resourceUtils_1.MAX_ATTRIBUTE_VALUE_CHAR_LENGTH; } });
__exportStar(require("./domain/privacy"), exports);
//# sourceMappingURL=index.js.map