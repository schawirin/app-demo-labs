import type { RumConfiguration, NodePrivacyLevel } from '@datadog/browser-rum-core';
import type { ElementsScrollPositions } from '../elementsScrollPositions';
import type { ShadowRootsController } from '../shadowRootsController';
type ParentNodePrivacyLevel = typeof NodePrivacyLevel.ALLOW | typeof NodePrivacyLevel.MASK | typeof NodePrivacyLevel.MASK_USER_INPUT;
export declare const enum SerializationContextStatus {
    INITIAL_FULL_SNAPSHOT = 0,
    SUBSEQUENT_FULL_SNAPSHOT = 1,
    MUTATION = 2
}
export type SerializationContext = {
    status: SerializationContextStatus.MUTATION;
    shadowRootsController: ShadowRootsController;
} | {
    status: SerializationContextStatus.INITIAL_FULL_SNAPSHOT;
    elementsScrollPositions: ElementsScrollPositions;
    shadowRootsController: ShadowRootsController;
} | {
    status: SerializationContextStatus.SUBSEQUENT_FULL_SNAPSHOT;
    elementsScrollPositions: ElementsScrollPositions;
    shadowRootsController: ShadowRootsController;
};
export interface SerializeOptions {
    serializedNodeIds?: Set<number>;
    ignoreWhiteSpace?: boolean;
    parentNodePrivacyLevel: ParentNodePrivacyLevel;
    serializationContext: SerializationContext;
    configuration: RumConfiguration;
}
export type NodeWithSerializedNode = Node & {
    s: 'Node with serialized node';
};
export {};
