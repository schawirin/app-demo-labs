import type { Duration, RelativeTime } from '@datadog/browser-core';
import type { RumConfiguration } from '../domain/configuration';
import type { LifeCycle } from '../domain/lifeCycle';
type RumPerformanceObserverConstructor = new (callback: PerformanceObserverCallback) => RumPerformanceObserver;
export interface BrowserWindow extends Window {
    PerformanceObserver: RumPerformanceObserverConstructor;
    performance: Performance & {
        interactionCount?: number;
    };
}
export interface RumPerformanceObserver extends PerformanceObserver {
    observe(options?: PerformanceObserverInit & {
        durationThreshold: number;
    }): void;
}
export declare enum RumPerformanceEntryType {
    EVENT = "event",
    FIRST_INPUT = "first-input",
    LARGEST_CONTENTFUL_PAINT = "largest-contentful-paint",
    LAYOUT_SHIFT = "layout-shift",
    LONG_TASK = "longtask",
    NAVIGATION = "navigation",
    PAINT = "paint",
    RESOURCE = "resource"
}
export interface RumPerformanceResourceTiming {
    entryType: RumPerformanceEntryType.RESOURCE;
    initiatorType: string;
    responseStatus?: number;
    name: string;
    startTime: RelativeTime;
    duration: Duration;
    fetchStart: RelativeTime;
    domainLookupStart: RelativeTime;
    domainLookupEnd: RelativeTime;
    connectStart: RelativeTime;
    secureConnectionStart: RelativeTime;
    connectEnd: RelativeTime;
    requestStart: RelativeTime;
    responseStart: RelativeTime;
    responseEnd: RelativeTime;
    redirectStart: RelativeTime;
    redirectEnd: RelativeTime;
    decodedBodySize: number;
    encodedBodySize: number;
    transferSize: number;
    renderBlockingStatus?: string;
    traceId?: string;
    toJSON(): Omit<PerformanceEntry, 'toJSON'>;
}
export interface RumPerformanceLongTaskTiming {
    name: string;
    entryType: RumPerformanceEntryType.LONG_TASK;
    startTime: RelativeTime;
    duration: Duration;
    toJSON(): Omit<PerformanceEntry, 'toJSON'>;
}
export interface RumPerformancePaintTiming {
    entryType: RumPerformanceEntryType.PAINT;
    name: 'first-paint' | 'first-contentful-paint';
    startTime: RelativeTime;
}
export interface RumPerformanceNavigationTiming {
    entryType: RumPerformanceEntryType.NAVIGATION;
    domComplete: RelativeTime;
    domContentLoadedEventEnd: RelativeTime;
    domInteractive: RelativeTime;
    loadEventEnd: RelativeTime;
    responseStart: RelativeTime;
}
export interface RumLargestContentfulPaintTiming {
    entryType: RumPerformanceEntryType.LARGEST_CONTENTFUL_PAINT;
    startTime: RelativeTime;
    size: number;
    element?: Element;
    toJSON(): Omit<RumLargestContentfulPaintTiming, 'toJSON'>;
}
export interface RumFirstInputTiming {
    entryType: RumPerformanceEntryType.FIRST_INPUT;
    startTime: RelativeTime;
    processingStart: RelativeTime;
    processingEnd: RelativeTime;
    duration: Duration;
    target?: Node;
    interactionId?: number;
    name: string;
}
export interface RumPerformanceEventTiming {
    entryType: RumPerformanceEntryType.EVENT;
    startTime: RelativeTime;
    processingStart: RelativeTime;
    processingEnd: RelativeTime;
    duration: Duration;
    interactionId?: number;
    target?: Node;
    name: string;
}
export interface RumLayoutShiftTiming {
    entryType: RumPerformanceEntryType.LAYOUT_SHIFT;
    startTime: RelativeTime;
    value: number;
    hadRecentInput: boolean;
    sources?: Array<{
        node?: Node;
    }>;
}
export type RumPerformanceEntry = RumPerformanceResourceTiming | RumPerformanceLongTaskTiming | RumPerformancePaintTiming | RumPerformanceNavigationTiming | RumLargestContentfulPaintTiming | RumFirstInputTiming | RumPerformanceEventTiming | RumLayoutShiftTiming;
export declare function supportPerformanceTimingEvent(entryType: RumPerformanceEntryType): boolean;
export declare function startPerformanceCollection(lifeCycle: LifeCycle, configuration: RumConfiguration): {
    stop: () => void;
};
export declare function retrieveInitialDocumentResourceTiming(configuration: RumConfiguration, callback: (timing: RumPerformanceResourceTiming) => void): void;
export type RelativePerformanceTiming = {
    -readonly [key in keyof Omit<PerformanceTiming, 'toJSON'>]: RelativeTime;
};
export {};
