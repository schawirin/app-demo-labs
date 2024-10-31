import { getInitCookie } from '@datadog/browser-core';
import { createCookieObservable } from '../../browser/cookieObservable';
export var CI_VISIBILITY_TEST_ID_COOKIE_NAME = 'datadog-ci-visibility-test-execution-id';
export function startCiVisibilityContext(configuration, cookieObservable) {
    var _a;
    if (cookieObservable === void 0) { cookieObservable = createCookieObservable(configuration, CI_VISIBILITY_TEST_ID_COOKIE_NAME); }
    var testExecutionId = getInitCookie(CI_VISIBILITY_TEST_ID_COOKIE_NAME) || ((_a = window.Cypress) === null || _a === void 0 ? void 0 : _a.env('traceId'));
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