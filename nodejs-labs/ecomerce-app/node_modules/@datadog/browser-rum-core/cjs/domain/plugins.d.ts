import type { RumPublicApi } from '../boot/rumPublicApi';
import type { RumInitConfiguration } from './configuration';
export interface RumPlugin {
    name: string;
    getConfigurationTelemetry?(): Record<string, unknown>;
    onInit?(options: {
        initConfiguration: RumInitConfiguration;
        publicApi: RumPublicApi;
    }): void;
}
type MethodNames = 'onInit';
type MethodParameter<MethodName extends MethodNames> = Parameters<NonNullable<RumPlugin[MethodName]>>[0];
export declare function callPluginsMethod<MethodName extends MethodNames>(plugins: RumPlugin[] | undefined, methodName: MethodName, parameter: MethodParameter<MethodName>): void;
export {};
