"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFetchObservable = initFetchObservable;
var instrumentMethod_1 = require("../tools/instrumentMethod");
var monitor_1 = require("../tools/monitor");
var observable_1 = require("../tools/observable");
var timeUtils_1 = require("../tools/utils/timeUtils");
var urlPolyfill_1 = require("../tools/utils/urlPolyfill");
var fetchObservable;
function initFetchObservable() {
    if (!fetchObservable) {
        fetchObservable = createFetchObservable();
    }
    return fetchObservable;
}
function createFetchObservable() {
    return new observable_1.Observable(function (observable) {
        if (!window.fetch) {
            return;
        }
        var stop = (0, instrumentMethod_1.instrumentMethod)(window, 'fetch', function (call) { return beforeSend(call, observable); }, {
            computeHandlingStack: true,
        }).stop;
        return stop;
    });
}
function beforeSend(_a, observable) {
    var parameters = _a.parameters, onPostCall = _a.onPostCall, handlingStack = _a.handlingStack;
    var input = parameters[0], init = parameters[1];
    var methodFromParams = init && init.method;
    if (methodFromParams === undefined && input instanceof Request) {
        methodFromParams = input.method;
    }
    var method = methodFromParams !== undefined ? String(methodFromParams).toUpperCase() : 'GET';
    var url = input instanceof Request ? input.url : (0, urlPolyfill_1.normalizeUrl)(String(input));
    var startClocks = (0, timeUtils_1.clocksNow)();
    var context = {
        state: 'start',
        init: init,
        input: input,
        method: method,
        startClocks: startClocks,
        url: url,
        handlingStack: handlingStack,
    };
    observable.notify(context);
    // Those properties can be changed by observable subscribers
    parameters[0] = context.input;
    parameters[1] = context.init;
    onPostCall(function (responsePromise) { return afterSend(observable, responsePromise, context); });
}
function afterSend(observable, responsePromise, startContext) {
    var reportFetch = function (response) {
        var context = startContext;
        context.state = 'resolve';
        if ('stack' in response || response instanceof Error) {
            context.status = 0;
            context.isAborted = response instanceof DOMException && response.code === DOMException.ABORT_ERR;
            context.error = response;
        }
        else if ('status' in response) {
            context.response = response;
            context.responseType = response.type;
            context.status = response.status;
            context.isAborted = false;
        }
        observable.notify(context);
    };
    responsePromise.then((0, monitor_1.monitor)(reportFetch), (0, monitor_1.monitor)(reportFetch));
}
//# sourceMappingURL=fetchObservable.js.map