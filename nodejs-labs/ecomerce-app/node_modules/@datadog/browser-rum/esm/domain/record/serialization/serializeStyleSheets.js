export function serializeStyleSheets(cssStyleSheets) {
    if (cssStyleSheets === undefined || cssStyleSheets.length === 0) {
        return undefined;
    }
    return cssStyleSheets.map(function (cssStyleSheet) {
        var rules = cssStyleSheet.cssRules || cssStyleSheet.rules;
        var cssRules = Array.from(rules, function (cssRule) { return cssRule.cssText; });
        var styleSheet = {
            cssRules: cssRules,
            disabled: cssStyleSheet.disabled || undefined,
            media: cssStyleSheet.media.length > 0 ? Array.from(cssStyleSheet.media) : undefined,
        };
        return styleSheet;
    });
}
//# sourceMappingURL=serializeStyleSheets.js.map