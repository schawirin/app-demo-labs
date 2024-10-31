"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTION_CONTEXT_TIME_OUT_DELAY = exports.CLICK_ACTION_MAX_DURATION = void 0;
exports.trackClickActions = trackClickActions;
exports.finalizeClicks = finalizeClicks;
var browser_core_1 = require("@datadog/browser-core");
var trackEventCounts_1 = require("../trackEventCounts");
var waitPageActivityEnd_1 = require("../waitPageActivityEnd");
var getSelectorFromElement_1 = require("../getSelectorFromElement");
var privacy_1 = require("../privacy");
var clickChain_1 = require("./clickChain");
var getActionNameFromElement_1 = require("./getActionNameFromElement");
var listenActionEvents_1 = require("./listenActionEvents");
var computeFrustration_1 = require("./computeFrustration");
// Maximum duration for click actions
exports.CLICK_ACTION_MAX_DURATION = 10 * browser_core_1.ONE_SECOND;
exports.ACTION_CONTEXT_TIME_OUT_DELAY = 5 * browser_core_1.ONE_MINUTE; // arbitrary
function trackClickActions(lifeCycle, domMutationObservable, configuration) {
    var history = new browser_core_1.ValueHistory(exports.ACTION_CONTEXT_TIME_OUT_DELAY);
    var stopObservable = new browser_core_1.Observable();
    var currentClickChain;
    lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, function () {
        history.reset();
    });
    lifeCycle.subscribe(5 /* LifeCycleEventType.VIEW_ENDED */, stopClickChain);
    var stopActionEventsListener = (0, listenActionEvents_1.listenActionEvents)(configuration, {
        onPointerDown: function (pointerDownEvent) {
            return processPointerDown(configuration, lifeCycle, domMutationObservable, pointerDownEvent);
        },
        onPointerUp: function (_a, startEvent, getUserActivity) {
            var clickActionBase = _a.clickActionBase, hadActivityOnPointerDown = _a.hadActivityOnPointerDown;
            startClickAction(configuration, lifeCycle, domMutationObservable, history, stopObservable, appendClickToClickChain, clickActionBase, startEvent, getUserActivity, hadActivityOnPointerDown);
        },
    }).stop;
    var actionContexts = {
        findActionId: function (startTime) { return history.findAll(startTime); },
    };
    return {
        stop: function () {
            stopClickChain();
            stopObservable.notify();
            stopActionEventsListener();
        },
        actionContexts: actionContexts,
    };
    function appendClickToClickChain(click) {
        if (!currentClickChain || !currentClickChain.tryAppend(click)) {
            var rageClick_1 = click.clone();
            currentClickChain = (0, clickChain_1.createClickChain)(click, function (clicks) {
                finalizeClicks(clicks, rageClick_1);
            });
        }
    }
    function stopClickChain() {
        if (currentClickChain) {
            currentClickChain.stop();
        }
    }
}
function processPointerDown(configuration, lifeCycle, domMutationObservable, pointerDownEvent) {
    var nodePrivacyLevel = configuration.enablePrivacyForActionName
        ? (0, privacy_1.getNodePrivacyLevel)(pointerDownEvent.target, configuration.defaultPrivacyLevel)
        : privacy_1.NodePrivacyLevel.ALLOW;
    if (nodePrivacyLevel === privacy_1.NodePrivacyLevel.HIDDEN) {
        return undefined;
    }
    var clickActionBase = computeClickActionBase(pointerDownEvent, nodePrivacyLevel, configuration);
    var hadActivityOnPointerDown = false;
    (0, waitPageActivityEnd_1.waitPageActivityEnd)(lifeCycle, domMutationObservable, configuration, function (pageActivityEndEvent) {
        hadActivityOnPointerDown = pageActivityEndEvent.hadActivity;
    }, 
    // We don't care about the activity duration, we just want to know whether an activity did happen
    // within the "validation delay" or not. Limit the duration so the callback is called sooner.
    waitPageActivityEnd_1.PAGE_ACTIVITY_VALIDATION_DELAY);
    return { clickActionBase: clickActionBase, hadActivityOnPointerDown: function () { return hadActivityOnPointerDown; } };
}
function startClickAction(configuration, lifeCycle, domMutationObservable, history, stopObservable, appendClickToClickChain, clickActionBase, startEvent, getUserActivity, hadActivityOnPointerDown) {
    var click = newClick(lifeCycle, history, getUserActivity, clickActionBase, startEvent);
    appendClickToClickChain(click);
    var stopWaitPageActivityEnd = (0, waitPageActivityEnd_1.waitPageActivityEnd)(lifeCycle, domMutationObservable, configuration, function (pageActivityEndEvent) {
        if (pageActivityEndEvent.hadActivity && pageActivityEndEvent.end < click.startClocks.timeStamp) {
            // If the clock is looking weird, just discard the click
            click.discard();
        }
        else {
            if (pageActivityEndEvent.hadActivity) {
                click.stop(pageActivityEndEvent.end);
            }
            else if (hadActivityOnPointerDown()) {
                click.stop(
                // using the click start as activity end, so the click will have some activity but its
                // duration will be 0 (as the activity started before the click start)
                click.startClocks.timeStamp);
            }
            else {
                click.stop();
            }
        }
    }, exports.CLICK_ACTION_MAX_DURATION).stop;
    var viewEndedSubscription = lifeCycle.subscribe(5 /* LifeCycleEventType.VIEW_ENDED */, function (_a) {
        var endClocks = _a.endClocks;
        click.stop(endClocks.timeStamp);
    });
    var stopSubscription = stopObservable.subscribe(function () {
        click.stop();
    });
    click.stopObservable.subscribe(function () {
        viewEndedSubscription.unsubscribe();
        stopWaitPageActivityEnd();
        stopSubscription.unsubscribe();
    });
}
function computeClickActionBase(event, nodePrivacyLevel, configuration) {
    var rect = event.target.getBoundingClientRect();
    return {
        type: "click" /* ActionType.CLICK */,
        target: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            selector: (0, getSelectorFromElement_1.getSelectorFromElement)(event.target, configuration.actionNameAttribute),
        },
        position: {
            // Use clientX and Y because for SVG element offsetX and Y are relatives to the <svg> element
            x: Math.round(event.clientX - rect.left),
            y: Math.round(event.clientY - rect.top),
        },
        name: (0, getActionNameFromElement_1.getActionNameFromElement)(event.target, configuration, nodePrivacyLevel),
    };
}
function newClick(lifeCycle, history, getUserActivity, clickActionBase, startEvent) {
    var id = (0, browser_core_1.generateUUID)();
    var startClocks = (0, browser_core_1.clocksNow)();
    var historyEntry = history.add(id, startClocks.relative);
    var eventCountsSubscription = (0, trackEventCounts_1.trackEventCounts)({
        lifeCycle: lifeCycle,
        isChildEvent: function (event) {
            return event.action !== undefined &&
                (Array.isArray(event.action.id) ? (0, browser_core_1.includes)(event.action.id, id) : event.action.id === id);
        },
    });
    var status = 0 /* ClickStatus.ONGOING */;
    var activityEndTime;
    var frustrationTypes = [];
    var stopObservable = new browser_core_1.Observable();
    function stop(newActivityEndTime) {
        if (status !== 0 /* ClickStatus.ONGOING */) {
            return;
        }
        activityEndTime = newActivityEndTime;
        status = 1 /* ClickStatus.STOPPED */;
        if (activityEndTime) {
            historyEntry.close((0, browser_core_1.getRelativeTime)(activityEndTime));
        }
        else {
            historyEntry.remove();
        }
        eventCountsSubscription.stop();
        stopObservable.notify();
    }
    return {
        event: startEvent,
        stop: stop,
        stopObservable: stopObservable,
        get hasError() {
            return eventCountsSubscription.eventCounts.errorCount > 0;
        },
        get hasPageActivity() {
            return activityEndTime !== undefined;
        },
        getUserActivity: getUserActivity,
        addFrustration: function (frustrationType) {
            frustrationTypes.push(frustrationType);
        },
        startClocks: startClocks,
        isStopped: function () { return status === 1 /* ClickStatus.STOPPED */ || status === 2 /* ClickStatus.FINALIZED */; },
        clone: function () { return newClick(lifeCycle, history, getUserActivity, clickActionBase, startEvent); },
        validate: function (domEvents) {
            stop();
            if (status !== 1 /* ClickStatus.STOPPED */) {
                return;
            }
            var _a = eventCountsSubscription.eventCounts, resourceCount = _a.resourceCount, errorCount = _a.errorCount, longTaskCount = _a.longTaskCount;
            var clickAction = (0, browser_core_1.assign)({
                type: "click" /* ActionType.CLICK */,
                duration: activityEndTime && (0, browser_core_1.elapsed)(startClocks.timeStamp, activityEndTime),
                startClocks: startClocks,
                id: id,
                frustrationTypes: frustrationTypes,
                counts: {
                    resourceCount: resourceCount,
                    errorCount: errorCount,
                    longTaskCount: longTaskCount,
                },
                events: domEvents !== null && domEvents !== void 0 ? domEvents : [startEvent],
                event: startEvent,
            }, clickActionBase);
            lifeCycle.notify(1 /* LifeCycleEventType.AUTO_ACTION_COMPLETED */, clickAction);
            status = 2 /* ClickStatus.FINALIZED */;
        },
        discard: function () {
            stop();
            status = 2 /* ClickStatus.FINALIZED */;
        },
    };
}
function finalizeClicks(clicks, rageClick) {
    var isRage = (0, computeFrustration_1.computeFrustration)(clicks, rageClick).isRage;
    if (isRage) {
        clicks.forEach(function (click) { return click.discard(); });
        rageClick.stop((0, browser_core_1.timeStampNow)());
        rageClick.validate(clicks.map(function (click) { return click.event; }));
    }
    else {
        rageClick.discard();
        clicks.forEach(function (click) { return click.validate(); });
    }
}
//# sourceMappingURL=trackClickActions.js.map