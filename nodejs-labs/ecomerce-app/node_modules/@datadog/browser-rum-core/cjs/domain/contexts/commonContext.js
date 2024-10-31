"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommonContext = buildCommonContext;
function buildCommonContext(globalContextManager, userContextManager, recorderApi) {
    return {
        context: globalContextManager.getContext(),
        user: userContextManager.getContext(),
        hasReplay: recorderApi.isRecording() ? true : undefined,
    };
}
//# sourceMappingURL=commonContext.js.map