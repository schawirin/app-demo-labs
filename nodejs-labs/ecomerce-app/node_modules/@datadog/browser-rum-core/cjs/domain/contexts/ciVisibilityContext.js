"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CI_VISIBILITY_TEST_ID_COOKIE_NAME = void 0;
exports.startCiVisibilityContext = startCiVisibilityContext;
var browser_core_1 = require("@datadog/browser-core");
var cookieObservable_1 = require("../../browser/cookieObservable");
exports.CI_VISIBILITY_TEST_ID_COOKIE_NAME = 'datadog-ci-visibility-test-execution-id';
function startCiVisibilityContext(configuration, cookieObservable) {
    var _a;
    if (cookieObservable === void 0) { cookieObservable = (0, cookieObservable_1.createCookieObservable)(configuration, exports.CI_VISIBILITY_TEST_ID_COOKIE_NAME); }
    var testExecutionId = (0, browser_core_1.getInitCookie)(exports.CI_VISIBILITY_TEST_ID_COOKIE_NAME) || ((_a = window.Cypress) === null || _a === void 0 ? void 0 : _a.env('traceId'));
    var cookieObservableSubscription = cookieObservable.subscribe(function (value) {
        testExecutionId = value;
    });
    return {
        get: function () {
            if (typeof testExecutionId === 'string') {
                return {
                    test_execution_id: testExecutionId,
                };
            }
        },
        stop: function () { return cookieObservableSubscription.unsubscribe(); },
    };
}
//# sourceMappingURL=ciVisibilityContext.js.map