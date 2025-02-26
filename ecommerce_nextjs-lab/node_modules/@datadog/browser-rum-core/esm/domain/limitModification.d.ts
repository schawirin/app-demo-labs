import type { Context } from '@datadog/browser-core';
export type ModifiableFieldPaths = Record<string, 'string' | 'object'>;
/**
 * Current limitation:
 * - field path do not support array, 'a.b.c' only
 */
export declare function limitModification<T extends Context, Result>(object: T, modifiableFieldPaths: ModifiableFieldPaths, modifier: (object: T) => Result): Result | undefined;
