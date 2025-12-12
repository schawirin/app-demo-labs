"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackStyleSheet = trackStyleSheet;
exports.getPathToNestedCSSRule = getPathToNestedCSSRule;
var browser_core_1 = require("@datadog/browser-core");
var types_1 = require("../../../types");
var serialization_1 = require("../serialization");
var assembly_1 = require("../assembly");
function trackStyleSheet(styleSheetCb) {
    function checkStyleSheetAndCallback(styleSheet, callback) {
        if (styleSheet && (0, serialization_1.hasSerializedNode)(styleSheet.ownerNode)) {
            callback((0, serialization_1.getSerializedNodeId)(styleSheet.ownerNode));
        }
    }
    var instrumentationStoppers = [
        (0, browser_core_1.instrumentMethod)(CSSStyleSheet.prototype, 'insertRule', function (_a) {
            var styleSheet = _a.target, _b = _a.parameters, rule = _b[0], index = _b[1];
            checkStyleSheetAndCallback(styleSheet, function (id) {
                return styleSheetCb((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.StyleSheetRule, {
                    id: id,
                    adds: [{ rule: rule, index: index }],
                }));
            });
        }),
        (0, browser_core_1.instrumentMethod)(CSSStyleSheet.prototype, 'deleteRule', function (_a) {
            var styleSheet = _a.target, index = _a.parameters[0];
            checkStyleSheetAndCallback(styleSheet, function (id) {
                return styleSheetCb((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.StyleSheetRule, {
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
        instrumentationStoppers.push((0, browser_core_1.instrumentMethod)(cls.prototype, 'insertRule', function (_a) {
            var styleSheet = _a.target, _b = _a.parameters, rule = _b[0], index = _b[1];
            checkStyleSheetAndCallback(styleSheet.parentStyleSheet, function (id) {
                var path = getPathToNestedCSSRule(styleSheet);
                if (path) {
                    path.push(index || 0);
                    styleSheetCb((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.StyleSheetRule, {
                        id: id,
                        adds: [{ rule: rule, index: path }],
                    }));
                }
            });
        }), (0, browser_core_1.instrumentMethod)(cls.prototype, 'deleteRule', function (_a) {
            var styleSheet = _a.target, index = _a.parameters[0];
            checkStyleSheetAndCallback(styleSheet.parentStyleSheet, function (id) {
                var path = getPathToNestedCSSRule(styleSheet);
                if (path) {
                    path.push(index);
                    styleSheetCb((0, assembly_1.assembleIncrementalSnapshot)(types_1.IncrementalSource.StyleSheetRule, {
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
function getPathToNestedCSSRule(rule) {
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