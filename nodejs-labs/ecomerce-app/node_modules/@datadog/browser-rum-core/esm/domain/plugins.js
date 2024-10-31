export function callPluginsMethod(plugins, methodName, parameter) {
    if (!plugins) {
        return;
    }
    for (var _i = 0, plugins_1 = plugins; _i < plugins_1.length; _i++) {
        var plugin = plugins_1[_i];
        var method = plugin[methodName];
        if (method) {
            method(parameter);
        }
    }
}
//# sourceMappingURL=plugins.js.map