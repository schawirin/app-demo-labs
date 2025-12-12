import type { Context } from '../tools/serialisation/context';
import type { Encoder } from '../tools/encoder';
import type { HttpRequest } from './httpRequest';
import type { FlushController } from './flushController';
export declare class Batch {
    private encoder;
    private request;
    flushController: FlushController;
    private messageBytesLimit;
    private upsertBuffer;
    private flushSubscription;
    constructor(encoder: Encoder, request: HttpRequest, flushController: FlushController, messageBytesLimit: number);
    add(message: Context): void;
    upsert(message: Context, key: string): void;
    stop(): void;
    private flush;
    private addOrUpdate;
    private push;
    private remove;
    private hasMessageFor;
}
