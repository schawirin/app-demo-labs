import type { ServerDuration } from '@datadog/browser-core';
import { ResourceType } from '@datadog/browser-core';
import type { RumPerformanceResourceTiming } from '../../browser/performanceCollection';
import type { PerformanceResourceDetailsElement } from '../../rawRumEvent.types';
import type { RumConfiguration } from '../configuration';
export interface PerformanceResourceDetails {
    redirect?: PerformanceResourceDetailsElement;
    dns?: PerformanceResourceDetailsElement;
    connect?: PerformanceResourceDetailsElement;
    ssl?: PerformanceResourceDetailsElement;
    first_byte?: PerformanceResourceDetailsElement;
    download?: PerformanceResourceDetailsElement;
}
export declare const FAKE_INITIAL_DOCUMENT = "initial_document";
export declare function computeResourceKind(timing: RumPerformanceResourceTiming): ResourceType;
export declare function isRequestKind(timing: RumPerformanceResourceTiming): boolean;
export declare function computePerformanceResourceDuration(entry: RumPerformanceResourceTiming): ServerDuration;
export declare function computePerformanceResourceDetails(entry: RumPerformanceResourceTiming): PerformanceResourceDetails | undefined;
export declare function isValidEntry(entry: RumPerformanceResourceTiming): boolean;
export declare function computeSize(entry: RumPerformanceResourceTiming): {
    size: number;
    encoded_body_size: number;
    decoded_body_size: number;
    transfer_size: number;
} | {
    size: undefined;
    encoded_body_size: undefined;
    decoded_body_size: undefined;
    transfer_size: undefined;
};
export declare function isAllowedRequestUrl(configuration: RumConfiguration, url: string): boolean | "";
export declare const MAX_ATTRIBUTE_VALUE_CHAR_LENGTH = 24000;
export declare function isLongDataUrl(url: string): boolean;
export declare function sanitizeDataUrl(url: string): string;
