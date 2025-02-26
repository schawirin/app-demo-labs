import type { Context, ContextManager, User } from '@datadog/browser-core';
import type { RecorderApi } from '../../boot/rumPublicApi';
export interface CommonContext {
    user: User;
    context: Context;
    hasReplay: true | undefined;
}
export declare function buildCommonContext(globalContextManager: ContextManager, userContextManager: ContextManager, recorderApi: RecorderApi): CommonContext;
