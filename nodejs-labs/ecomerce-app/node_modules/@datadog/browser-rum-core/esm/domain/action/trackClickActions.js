import { includes, timeStampNow, Observable, assign, getRelativeTime, ONE_MINUTE, ValueHistory, generateUUID, clocksNow, ONE_SECOND, elapsed, } from '@datadog/browser-core';
import { trackEventCounts } from '../trackEventCounts';
import { PAGE_ACTIVITY_VALIDATION_DELAY, waitPageActivityEnd } from '../waitPageActivityEnd';
import { getSelectorFromElement } from '../getSelectorFromElement';
import { getNodePrivacyLevel, NodePrivacyLevel } from '../privacy';
import { createClickChain } from './clickChain';
import { getActionNameFromElement } from './getActionNameFromElement';
import { listenActionEvents } from './listenActionEvents';
import { computeFrustration } from './computeFrustration';
// Maximum duration for click actions
export var CLICK_ACTION_MAX_DURATION = 10 * ONE_SECOND;
export var ACTION_CONTEXT_TIME_OUT_DELAY = 5 * ONE_MINUTE; // arbitrary
export function trackClickActions(lifeCycle, domMutationObservable, configuration) {
    var history = new ValueHistory(ACTION_CONTEXT_TIME_OUT_DELAY);
    var stopObservable = new Observable();
    var currentClickChain;
    lifeCycle.subscribe(10 /* LifeCycleEventType.SESSION_RENEWED */, function () {
        history.reset();
    });
    lifeCycle.subscribe(5 /* LifeCycleEventType.VIEW_ENDED */, stopClickChain);
    var stopActionEventsListener = listenActionEvents(configuration, {
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
            currentClickChain = createClickChain(click, function (clicks) {
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
        ? getNodePrivacyLevel(pointerDownEvent.target, configuration.defaultPrivacyLevel)
        : NodePrivacyLevel.ALLOW;
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        return undefined;
    }
    var clickActionBase = computeClickActionBase(pointerDownEvent, nodePrivacyLevel, configuration);
    var hadActivityOnPointerDown = false;
    waitPageActivityEnd(lifeCycle, domMutationObservable, configuration, function (pageActivityEndEvent) {
        hadActivityOnPointerDown = pageActivityEndEvent.hadActivity;
    }, 
    // We don't care about the activity duration, we just want to know whether an activity did happen
    // within the "validation delay" or not. Limit the duration so the callback is called sooner.
    PAGE_ACTIVITY_VALIDATION_DELAY);
    return { clickActionBase: clickActionBase, hadActivityOnPointerDown: function () { return hadActivityOnPointerDown; } };
}
function startClickAction(configuration, lifeCycle, domMutationObservable, history, stopObservable, appendClickToClickChain, clickActionBase, startEvent, getUserActivity, hadActivityOnPointerDown) {
    var click = newClick(lifeCycle, history, getUserActivity, clickActionBase, startEvent);
    appendClickToClickChain(click);
    var stopWaitPageActivityEnd = waitPageActivityEnd(lifeCycle, domMutationObservable, configuration, function (pageActivityEndEvent) {
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
    }, CLICK_ACTION_MAX_DURATION).stop;
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
            selector: getSelectorFromElement(event.target, configuration.actionNameAttribute),
        },
        position: {
            // Use clientX and Y because for SVG element offsetX and Y are relatives to the <svg> element
            x: Math.round(event.clientX - rect.left),
            y: Math.round(event.clientY - rect.top),
        },
        name: getActionNameFromElement(event.target, configuration, nodePrivacyLevel),
    };
}
function newClick(lifeCycle, history, getUserActivity, clickActionBase, startEvent) {
    var id = generateUUID();
    var startClocks = clocksNow();
    var historyEntry = history.add(id, startClocks.relative);
    var eventCountsSubscription = trackEventCounts({
        lifeCycle: lifeCycle,
        isChildEvent: function (event) {
            return event.action !== undefined &&
                (Array.isArray(event.action.id) ? includes(event.action.id, id) : event.action.id === id);
        },
    });
    var status = 0 /* ClickStatus.ONGOING */;
    var activityEndTime;
    var frustrationTypes = [];
    var stopObservable = new Observable();
    function stop(newActivityEndTime) {
        if (status !== 0 /* ClickStatus.ONGOING */) {
            return;
        }
        activityEndTime = newActivityEndTime;
        status = 1 /* ClickStatus.STOPPED */;
        if (activityEndTime) {
            historyEntry.close(getRelativeTime(activityEndTime));
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
            var clickAction = assign({
                type: "click" /* ActionType.CLICK */,
                duration: activityEndTime && elapsed(startClocks.timeStamp, activityEndTime),
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
export function finalizeClicks(clicks, rageClick) {
    var isRage = computeFrustration(clicks, rageClick).isRage;
    if (isRage) {
        clicks.forEach(function (click) { return click.discard(); });
        rageClick.stop(timeStampNow());
        rageClick.validate(clicks.map(function (click) { return click.event; }));
    }
    else {
        rageClick.discard();
        clicks.forEach(function (click) { return click.validate(); });
    }
}
//# sourceMappingURL=trackClickActions.js.map