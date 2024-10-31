import { instrumentMethod } from '@datadog/browser-core';
import { IncrementalSource } from '../../../types';
import { getSerializedNodeId, hasSerializedNode } from '../serialization';
import { assembleIncrementalSnapshot } from '../assembly';
export function trackStyleSheet(styleSheetCb) {
    function checkStyleSheetAndCallback(styleSheet, callback) {
        if (styleSheet && hasSerializedNode(styleSheet.ownerNode)) {
            callback(getSerializedNodeId(styleSheet.ownerNode));
        }
    }
    var instrumentationStoppers = [
        instrumentMethod(CSSStyleSheet.prototype, 'insertRule', function (_a) {
            var styleSheet = _a.target, _b = _a.parameters, rule = _b[0], index = _b[1];
            checkStyleSheetAndCallback(styleSheet, function (id) {
                return styleSheetCb(assembleIncrementalSnapshot(IncrementalSource.StyleSheetRule, {
                    id: id,
                    adds: [{ rule: rule, index: index }],
                }));
            });
        }),
        instrumentMethod(CSSStyleSheet.prototype, 'deleteRule', function (_a) {
            var styleSheet = _a.target, index = _a.parameters[0];
            checkStyleSheetAndCallback(styleSheet, function (id) {
                return styleSheetCb(assembleIncrementalSnapshot(IncrementalSource.StyleSheetRule, {
                    id: id,
                    removes: [{ index: index }],
                }));
            });
        }),
    ];
    if (typeof CSSGroupingRule !== 'undefined') {
        instrumentGroupingCSSRuleClass(CSSGroupingRule);
    }
    else {
        instrumentGroupingCSSRuleClass(CSSMediaRule);
        instrumentGroupingCSSRuleClass(CSSSupportsRule);
    }
    function instrumentGroupingCSSRuleClass(cls) {
        instrumentationStoppers.push(instrumentMethod(cls.prototype, 'insertRule', function (_a) {
            var styleSheet = _a.target, _b = _a.parameters, rule = _b[0], index = _b[1];
            checkStyleSheetAndCallback(styleSheet.parentStyleSheet, function (id) {
                var path = getPathToNestedCSSRule(styleSheet);
                if (path) {
                    path.push(index || 0);
                    styleSheetCb(assembleIncrementalSnapshot(IncrementalSource.StyleSheetRule, {
                        id: id,
                        adds: [{ rule: rule, index: path }],
                    }));
                }
            });
        }), instrumentMethod(cls.prototype, 'deleteRule', function (_a) {
            var styleSheet = _a.target, index = _a.parameters[0];
            checkStyleSheetAndCallback(styleSheet.parentStyleSheet, function (id) {
                var path = getPathToNestedCSSRule(styleSheet);
                if (path) {
                    path.push(index);
                    styleSheetCb(assembleIncrementalSnapshot(IncrementalSource.StyleSheetRule, {
                        id: id,
                        removes: [{ index: path }],
                    }));
                }
            });
        }));
    }
    return {
        stop: function () {
            instrumentationStoppers.forEach(function (stopper) { return stopper.stop(); });
        },
    };
}
export function getPathToNestedCSSRule(rule) {
    var path = [];
    var currentRule = rule;
    while (currentRule.parentRule) {
        var rules_1 = Array.from(currentRule.parentRule.cssRules);
        var index_1 = rules_1.indexOf(currentRule);
        path.unshift(index_1);
        currentRule = currentRule.parentRule;
    }
    // A rule may not be attached to a stylesheet
    if (!currentRule.parentStyleSheet) {
        return;
    }
    var rules = Array.from(currentRule.parentStyleSheet.cssRules);
    var index = rules.indexOf(currentRule);
    path.unshift(index);
    return path;
}
//# sourceMappingURL=trackStyleSheet.js.map