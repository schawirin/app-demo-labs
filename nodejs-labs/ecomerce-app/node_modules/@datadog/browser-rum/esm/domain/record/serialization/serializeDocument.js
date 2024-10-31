import { serializeNodeWithId } from './serializeNode';
export function serializeDocument(document, configuration, serializationContext) {
    // We are sure that Documents are never ignored, so this function never returns null
    return serializeNodeWithId(document, {
        serializationContext: serializationContext,
        parentNodePrivacyLevel: configuration.defaultPrivacyLevel,
        configuration: configuration,
    });
}
//# sourceMappingURL=serializeDocument.js.map