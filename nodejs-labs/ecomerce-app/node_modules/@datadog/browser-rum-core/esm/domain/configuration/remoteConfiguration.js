import { display, addEventListener, assign } from '@datadog/browser-core';
export var REMOTE_CONFIGURATION_URL = 'https://d3uc069fcn7uxw.cloudfront.net/configuration';
export function fetchAndApplyRemoteConfiguration(initConfiguration, callback) {
    fetchRemoteConfiguration(initConfiguration, function (remoteInitConfiguration) {
        callback(applyRemoteConfiguration(initConfiguration, remoteInitConfiguration));
    });
}
export function applyRemoteConfiguration(initConfiguration, remoteInitConfiguration) {
    return assign({}, initConfiguration, remoteInitConfiguration);
}
export function fetchRemoteConfiguration(configuration, callback) {
    var xhr = new XMLHttpRequest();
    addEventListener(configuration, xhr, 'load', function () {
        if (xhr.status === 200) {
            callback(JSON.parse(xhr.responseText));
        }
        else {
            displayRemoteConfigurationFetchingError();
        }
    });
    addEventListener(configuration, xhr, 'error', function () {
        displayRemoteConfigurationFetchingError();
    });
    xhr.open('GET', "".concat(REMOTE_CONFIGURATION_URL, "/").concat(encodeURIComponent(configuration.remoteConfigurationId), ".json"));
    xhr.send();
}
function displayRemoteConfigurationFetchingError() {
    display.error('Error fetching the remote configuration.');
}
//# sourceMappingURL=remoteConfiguration.js.map