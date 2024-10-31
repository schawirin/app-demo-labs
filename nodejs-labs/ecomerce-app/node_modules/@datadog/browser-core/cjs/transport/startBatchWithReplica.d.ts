import type { Configuration, EndpointBuilder } from '../domain/configuration';
import type { Context } from '../tools/serialisation/context';
import type { Observable } from '../tools/observable';
import type { PageExitEvent } from '../browser/pageExitObservable';
import type { RawError } from '../domain/error/error.types';
import type { Encoder } from '../tools/encoder';
export interface BatchConfiguration {
    endpoint: EndpointBuilder;
    encoder: Encoder;
}
interface ReplicaBatchConfiguration<T> extends BatchConfiguration {
    transformMessage?: (message: T) => T;
}
export declare function startBatchWithReplica<T extends Context>(configuration: Configuration, primary: BatchConfiguration, replica: ReplicaBatchConfiguration<T> | undefined, reportError: (error: RawError) => void, pageExitObservable: Observable<PageExitEvent>, sessionExpireObservable: Observable<void>): {
    flushObservable: Observable<import("./flushController").FlushEvent>;
    add(message: T, replicated?: boolean): void;
    upsert: (message: T, key: string) => void;
    stop: () => void;
};
export {};
