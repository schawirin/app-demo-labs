import { getViewportDimension, initViewportObservable } from '../../browser/viewportObservable';
export function startDisplayContext(configuration) {
    var viewport = getViewportDimension();
    var unsubscribeViewport = initViewportObservable(configuration).subscribe(function (viewportDimension) {
        viewport = viewportDimension;
    }).unsubscribe;
    return {
        get: function () { return ({ viewport: viewport }); },
        stop: unsubscribeViewport,
    };
}
//# sourceMappingURL=displayContext.js.map