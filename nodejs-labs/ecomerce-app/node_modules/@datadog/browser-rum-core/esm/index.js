export { makeRumPublicApi } from './boot/rumPublicApi';
export { startRum } from './boot/startRum';
export { LifeCycle } from './domain/lifeCycle';
export { startViewContexts } from './domain/contexts/viewContexts';
export { getMutationObserverConstructor } from './browser/domMutationObservable';
export { initViewportObservable, getViewportDimension } from './browser/viewportObservable';
export { getScrollX, getScrollY } from './browser/scroll';
export { DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE } from './domain/action/getActionNameFromElement';
export { STABLE_ATTRIBUTES } from './domain/getSelectorFromElement';
export * from './browser/htmlDomUtils';
export * from './browser/polyfills';
export { getSessionReplayUrl } from './domain/getSessionReplayUrl';
export { isLongDataUrl, sanitizeDataUrl, MAX_ATTRIBUTE_VALUE_CHAR_LENGTH } from './domain/resource/resourceUtils';
export * from './domain/privacy';
//# sourceMappingURL=index.js.map