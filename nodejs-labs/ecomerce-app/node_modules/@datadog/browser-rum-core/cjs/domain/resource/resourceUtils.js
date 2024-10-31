"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ATTRIBUTE_VALUE_CHAR_LENGTH = exports.FAKE_INITIAL_DOCUMENT = void 0;
exports.computeResourceKind = computeResourceKind;
exports.isRequestKind = isRequestKind;
exports.computePerformanceResourceDuration = computePerformanceResourceDuration;
exports.computePerformanceResourceDetails = computePerformanceResourceDetails;
exports.isValidEntry = isValidEntry;
exports.computeSize = computeSize;
exports.isAllowedRequestUrl = isAllowedRequestUrl;
exports.isLongDataUrl = isLongDataUrl;
exports.sanitizeDataUrl = sanitizeDataUrl;
var browser_core_1 = require("@datadog/browser-core");
exports.FAKE_INITIAL_DOCUMENT = 'initial_document';
var RESOURCE_TYPES = [
    ["document" /* ResourceType.DOCUMENT */, function (initiatorType) { return exports.FAKE_INITIAL_DOCUMENT === initiatorType; }],
    ["xhr" /* ResourceType.XHR */, function (initiatorType) { return 'xmlhttprequest' === initiatorType; }],
    ["fetch" /* ResourceType.FETCH */, function (initiatorType) { return 'fetch' === initiatorType; }],
    ["beacon" /* ResourceType.BEACON */, function (initiatorType) { return 'beacon' === initiatorType; }],
    ["css" /* ResourceType.CSS */, function (_, path) { return /\.css$/i.test(path); }],
    ["js" /* ResourceType.JS */, function (_, path) { return /\.js$/i.test(path); }],
    [
        "image" /* ResourceType.IMAGE */,
        function (initiatorType, path) {
            return (0, browser_core_1.includes)(['image', 'img', 'icon'], initiatorType) || /\.(gif|jpg|jpeg|tiff|png|svg|ico)$/i.exec(path) !== null;
        },
    ],
    ["font" /* ResourceType.FONT */, function (_, path) { return /\.(woff|eot|woff2|ttf)$/i.exec(path) !== null; }],
    [
        "media" /* ResourceType.MEDIA */,
        function (initiatorType, path) {
            return (0, browser_core_1.includes)(['audio', 'video'], initiatorType) || /\.(mp3|mp4)$/i.exec(path) !== null;
        },
    ],
];
function computeResourceKind(timing) {
    var url = timing.name;
    if (!(0, browser_core_1.isValidUrl)(url)) {
        (0, browser_core_1.addTelemetryDebug)("Failed to construct URL for \"".concat(timing.name, "\""));
        return "other" /* ResourceType.OTHER */;
    }
    var path = (0, browser_core_1.getPathName)(url);
    for (var _i = 0, RESOURCE_TYPES_1 = RESOURCE_TYPES; _i < RESOURCE_TYPES_1.length; _i++) {
        var _a = RESOURCE_TYPES_1[_i], type = _a[0], isType = _a[1];
        if (isType(timing.initiatorType, path)) {
            return type;
        }
    }
    return "other" /* ResourceType.OTHER */;
}
function areInOrder() {
    var numbers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        numbers[_i] = arguments[_i];
    }
    for (var i = 1; i < numbers.length; i += 1) {
        if (numbers[i - 1] > numbers[i]) {
            return false;
        }
    }
    return true;
}
function isRequestKind(timing) {
    return timing.initiatorType === 'xmlhttprequest' || timing.initiatorType === 'fetch';
}
function computePerformanceResourceDuration(entry) {
    var duration = entry.duration, startTime = entry.startTime, responseEnd = entry.responseEnd;
    // Safari duration is always 0 on timings blocked by cross origin policies.
    if (duration === 0 && startTime < responseEnd) {
        return (0, browser_core_1.toServerDuration)((0, browser_core_1.elapsed)(startTime, responseEnd));
    }
    return (0, browser_core_1.toServerDuration)(duration);
}
function computePerformanceResourceDetails(entry) {
    if (!isValidEntry(entry)) {
        return undefined;
    }
    var startTime = entry.startTime, fetchStart = entry.fetchStart, redirectStart = entry.redirectStart, redirectEnd = entry.redirectEnd, domainLookupStart = entry.domainLookupStart, domainLookupEnd = entry.domainLookupEnd, connectStart = entry.connectStart, secureConnectionStart = entry.secureConnectionStart, connectEnd = entry.connectEnd, requestStart = entry.requestStart, responseStart = entry.responseStart, responseEnd = entry.responseEnd;
    var details = {
        download: formatTiming(startTime, responseStart, responseEnd),
        first_byte: formatTiming(startTime, requestStart, responseStart),
    };
    // Make sure a connection occurred
    if (fetchStart < connectEnd) {
        details.connect = formatTiming(startTime, connectStart, connectEnd);
        // Make sure a secure connection occurred
        if (connectStart <= secureConnectionStart && secureConnectionStart <= connectEnd) {
            details.ssl = formatTiming(startTime, secureConnectionStart, connectEnd);
        }
    }
    // Make sure a domain lookup occurred
    if (fetchStart < domainLookupEnd) {
        details.dns = formatTiming(startTime, domainLookupStart, domainLookupEnd);
    }
    // Make sure a redirection occurred
    if (startTime < redirectEnd) {
        details.redirect = formatTiming(startTime, redirectStart, redirectEnd);
    }
    return details;
}
function isValidEntry(entry) {
    if ((0, browser_core_1.isExperimentalFeatureEnabled)(browser_core_1.ExperimentalFeature.TOLERANT_RESOURCE_TIMINGS)) {
        return true;
    }
    // Ensure timings are in the right order. On top of filtering out potential invalid
    // RumPerformanceResourceTiming, it will ignore entries from requests where timings cannot be
    // collected, for example cross origin requests without a "Timing-Allow-Origin" header allowing
    // it.
    var areCommonTimingsInOrder = areInOrder(entry.startTime, entry.fetchStart, entry.domainLookupStart, entry.domainLookupEnd, entry.connectStart, entry.connectEnd, entry.requestStart, entry.responseStart, entry.responseEnd);
    var areRedirectionTimingsInOrder = hasRedirection(entry)
        ? areInOrder(entry.startTime, entry.redirectStart, entry.redirectEnd, entry.fetchStart)
        : true;
    return areCommonTimingsInOrder && areRedirectionTimingsInOrder;
}
function hasRedirection(entry) {
    return entry.redirectEnd > entry.startTime;
}
function formatTiming(origin, start, end) {
    if (origin <= start && start <= end) {
        return {
            duration: (0, browser_core_1.toServerDuration)((0, browser_core_1.elapsed)(start, end)),
            start: (0, browser_core_1.toServerDuration)((0, browser_core_1.elapsed)(origin, start)),
        };
    }
}
function computeSize(entry) {
    // Make sure a request actually occurred
    if (entry.startTime < entry.responseStart) {
        var encodedBodySize = entry.encodedBodySize, decodedBodySize = entry.decodedBodySize, transferSize = entry.transferSize;
        return {
            size: decodedBodySize,
            encoded_body_size: encodedBodySize,
            decoded_body_size: decodedBodySize,
            transfer_size: transferSize,
        };
    }
    return {
        size: undefined,
        encoded_body_size: undefined,
        decoded_body_size: undefined,
        transfer_size: undefined,
    };
}
function isAllowedRequestUrl(configuration, url) {
    return url && !configuration.isIntakeUrl(url);
}
var DATA_URL_REGEX = /data:(.+)?(;base64)?,/g;
exports.MAX_ATTRIBUTE_VALUE_CHAR_LENGTH = 24000;
function isLongDataUrl(url) {
    if (url.length <= exports.MAX_ATTRIBUTE_VALUE_CHAR_LENGTH) {
        return false;
    }
    else if (url.substring(0, 5) === 'data:') {
        // Avoid String.match RangeError: Maximum call stack size exceeded
        url = url.substring(0, exports.MAX_ATTRIBUTE_VALUE_CHAR_LENGTH);
        return true;
    }
    return false;
}
function sanitizeDataUrl(url) {
    return "".concat(url.match(DATA_URL_REGEX)[0], "[...]");
}
//# sourceMappingURL=resourceUtils.js.map