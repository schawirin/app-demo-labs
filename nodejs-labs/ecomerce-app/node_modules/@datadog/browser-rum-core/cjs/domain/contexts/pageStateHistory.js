"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGE_STATE_CONTEXT_TIME_OUT_DELAY = exports.MAX_PAGE_STATE_ENTRIES_SELECTABLE = exports.MAX_PAGE_STATE_ENTRIES = void 0;
exports.startPageStateHistory = startPageStateHistory;
var browser_core_1 = require("@datadog/browser-core");
// Arbitrary value to cap number of element for memory consumption in the browser
exports.MAX_PAGE_STATE_ENTRIES = 4000;
// Arbitrary value to cap number of element for backend & to save bandwidth
exports.MAX_PAGE_STATE_ENTRIES_SELECTABLE = 500;
exports.PAGE_STATE_CONTEXT_TIME_OUT_DELAY = browser_core_1.SESSION_TIME_OUT_DELAY;
function startPageStateHistory(configuration, maxPageStateEntriesSelectable) {
    if (maxPageStateEntriesSelectable === void 0) { maxPageStateEntriesSelectable = exports.MAX_PAGE_STATE_ENTRIES_SELECTABLE; }
    var pageStateEntryHistory = new browser_core_1.ValueHistory(exports.PAGE_STATE_CONTEXT_TIME_OUT_DELAY, exports.MAX_PAGE_STATE_ENTRIES);
    var currentPageState;
    addPageState(getPageState(), (0, browser_core_1.relativeNow)());
    var stopEventListeners = (0, browser_core_1.addEventListeners)(configuration, window, [
        browser_core_1.DOM_EVENT.PAGE_SHOW,
        browser_core_1.DOM_EVENT.FOCUS,
        browser_core_1.DOM_EVENT.BLUR,
        browser_core_1.DOM_EVENT.VISIBILITY_CHANGE,
        browser_core_1.DOM_EVENT.RESUME,
        browser_core_1.DOM_EVENT.FREEZE,
        browser_core_1.DOM_EVENT.PAGE_HIDE,
    ], function (event) {
        addPageState(computePageState(event), event.timeStamp);
    }, { capture: true }).stop;
    function addPageState(nextPageState, startTime) {
        if (startTime === void 0) { startTime = (0, browser_core_1.relativeNow)(); }
        if (nextPageState === currentPageState) {
            return;
        }
        currentPageState = nextPageState;
        pageStateEntryHistory.closeActive(startTime);
        pageStateEntryHistory.add({ state: currentPageState, startTime: startTime }, startTime);
    }
    var pageStateHistory = {
        findAll: function (eventStartTime, duration) {
            var pageStateEntries = pageStateEntryHistory.findAll(eventStartTime, duration);
            if (pageStateEntries.length === 0) {
                return;
            }
            var pageStateServerEntries = [];
            // limit the number of entries to return
            var limit = Math.max(0, pageStateEntries.length - maxPageStateEntriesSelectable);
            // loop page state entries backward to return the selected ones in desc order
            for (var index = pageStateEntries.length - 1; index >= limit; index--) {
                var pageState = pageStateEntries[index];
                // compute the start time relative to the event start time (ex: to be relative to the view start time)
                var relativeStartTime = (0, browser_core_1.elapsed)(eventStartTime, pageState.startTime);
                pageStateServerEntries.push({
                    state: pageState.state,
                    start: (0, browser_core_1.toServerDuration)(relativeStartTime),
                });
            }
            return pageStateServerEntries;
        },
        wasInPageStateAt: function (state, startTime) {
            return pageStateHistory.wasInPageStateDuringPeriod(state, startTime, 0);
        },
        wasInPageStateDuringPeriod: function (state, startTime, duration) {
            return pageStateEntryHistory.findAll(startTime, duration).some(function (pageState) { return pageState.state === state; });
        },
        addPageState: addPageState,
        stop: function () {
            stopEventListeners();
            pageStateEntryHistory.stop();
        },
    };
    return pageStateHistory;
}
function computePageState(event) {
    if (event.type === browser_core_1.DOM_EVENT.FREEZE) {
        return "frozen" /* PageState.FROZEN */;
    }
    else if (event.type === browser_core_1.DOM_EVENT.PAGE_HIDE) {
        return event.persisted ? "frozen" /* PageState.FROZEN */ : "terminated" /* PageState.TERMINATED */;
    }
    return getPageState();
}
function getPageState() {
    if (document.visibilityState === 'hidden') {
        return "hidden" /* PageState.HIDDEN */;
    }
    if (document.hasFocus()) {
        return "active" /* PageState.ACTIVE */;
    }
    return "passive" /* PageState.PASSIVE */;
}
//# sourceMappingURL=pageStateHistory.js.map