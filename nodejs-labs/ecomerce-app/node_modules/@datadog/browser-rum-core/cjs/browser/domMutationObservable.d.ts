import { Observable } from '@datadog/browser-core';
export declare function createDOMMutationObservable(): Observable<void>;
type MutationObserverConstructor = new (callback: MutationCallback) => MutationObserver;
export interface BrowserWindow extends Window {
    MutationObserver?: MutationObserverConstructor;
    Zone?: unknown;
}
export declare function getMutationObserverConstructor(): MutationObserverConstructor | undefined;
export {};
