import type { TrackingConsentState, DeflateWorker } from '@datadog/browser-core';
import { type RumConfiguration } from '../domain/configuration';
import type { CommonContext } from '../domain/contexts/commonContext';
import type { ViewOptions } from '../domain/view/trackViews';
import type { RumPublicApiOptions, Strategy } from './rumPublicApi';
import type { StartRumResult } from './startRum';
export declare function createPreStartStrategy({ ignoreInitIfSyntheticsWillInjectRum, startDeflateWorker }: RumPublicApiOptions, getCommonContext: () => CommonContext, trackingConsentState: TrackingConsentState, doStartRum: (configuration: RumConfiguration, deflateWorker: DeflateWorker | undefined, initialViewOptions?: ViewOptions) => StartRumResult): Strategy;
