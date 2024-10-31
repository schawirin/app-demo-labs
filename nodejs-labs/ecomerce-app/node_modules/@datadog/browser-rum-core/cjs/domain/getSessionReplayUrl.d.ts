import type { RumConfiguration } from './configuration';
import type { ViewContext } from './contexts/viewContexts';
import type { RumSession } from './rumSessionManager';
export declare function getSessionReplayUrl(configuration: RumConfiguration, { session, viewContext, errorType, }: {
    session?: RumSession;
    viewContext?: ViewContext;
    errorType?: string;
}): string;
export declare function getDatadogSiteUrl(rumConfiguration: RumConfiguration): string;
