import type { DefaultPrivacyLevel } from '@datadog/browser-core';
import type { RumInitConfiguration } from './configuration';
export declare const REMOTE_CONFIGURATION_URL = "https://d3uc069fcn7uxw.cloudfront.net/configuration";
export interface RumRemoteConfiguration {
    sessionSampleRate?: number;
    sessionReplaySampleRate?: number;
    defaultPrivacyLevel?: DefaultPrivacyLevel;
}
export declare function fetchAndApplyRemoteConfiguration(initConfiguration: RumInitConfiguration, callback: (initConfiguration: RumInitConfiguration) => void): void;
export declare function applyRemoteConfiguration(initConfiguration: RumInitConfiguration, remoteInitConfiguration: RumRemoteConfiguration): RumInitConfiguration & RumRemoteConfiguration;
export declare function fetchRemoteConfiguration(configuration: RumInitConfiguration, callback: (remoteConfiguration: RumRemoteConfiguration) => void): void;
