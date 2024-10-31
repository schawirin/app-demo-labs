import type { RumConfiguration } from '../configuration';
export type DisplayContext = ReturnType<typeof startDisplayContext>;
export declare function startDisplayContext(configuration: RumConfiguration): {
    get: () => {
        viewport: import("../../browser/viewportObservable").ViewportDimension;
    };
    stop: () => void;
};
