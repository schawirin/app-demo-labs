import { NodePrivacyLevel } from '@datadog/browser-rum-core';
import type { RumConfiguration } from '@datadog/browser-rum-core';
export declare function serializeAttribute(element: Element, nodePrivacyLevel: NodePrivacyLevel, attributeName: string, configuration: RumConfiguration): string | number | boolean | null;
