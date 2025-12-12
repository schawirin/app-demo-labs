"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REMOTE_CONFIGURATION_URL = void 0;
exports.fetchAndApplyRemoteConfiguration = fetchAndApplyRemoteConfiguration;
exports.applyRemoteConfiguration = applyRemoteConfiguration;
exports.fetchRemoteConfiguration = fetchRemoteConfiguration;
var browser_core_1 = require("@datadog/browser-core");
exports.REMOTE_CONFIGURATION_URL = 'https://d3uc069fcn7uxw.cloudfront.net/configuration';
function fetchAndApplyRemoteConfiguration(initConfiguration, callback) {
    fetchRemoteConfiguration(initConfiguration, function (remoteInitConfiguration) {
        callback(applyRemoteConfiguration(initConfiguration, remoteInitConfiguration));
    });
}
function applyRemoteConfiguration(initConfiguration, remoteInitConfiguration) {
    return (0, browser_core_1.assign)({}, initConfiguration, remoteInitConfiguration);
}
function fetchRemoteConfiguration(configuration, callback) {
    var xhr = new XMLHttpRequest();
    (0, browser_core_1.addEventListener)(configuration, xhr, 'load', function () {
        if (xhr.status === 200) {
            callback(JSON.parse(xhr.responseText));
        }
        else {
            displayRemoteConfigurationFetchingError();
        }
    });
    (0, browser_core_1.addEventListener)(configuration, xhr, 'error', function () {
        displayRemoteConfigurationFetchingError();
    });
    xhr.open('GET', "".concat(exports.REMOTE_CONFIGURATION_URL, "/").concat(encodeURIComponent(configuration.remoteConfigurationId), ".json"));
    xhr.send();
}
function displayRemoteConfigurationFetchingError() {
    browser_core_1.display.error('Error fetching the remote configuration.');
}
//# sourceMappingURL=remoteConfiguration.js.map