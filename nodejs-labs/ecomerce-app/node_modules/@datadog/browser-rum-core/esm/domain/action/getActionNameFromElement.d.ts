import { NodePrivacyLevel } from '../privacy';
import type { RumConfiguration } from '../configuration';
/**
 * Get the action name from the attribute 'data-dd-action-name' on the element or any of its parent.
 * It can also be retrieved from a user defined attribute.
 */
export declare const DEFAULT_PROGRAMMATIC_ACTION_NAME_ATTRIBUTE = "data-dd-action-name";
export declare const ACTION_NAME_PLACEHOLDER = "Masked Element";
export declare function getActionNameFromElement(element: Element, { enablePrivacyForActionName, actionNameAttribute: userProgrammaticAttribute }: RumConfiguration, nodePrivacyLevel?: NodePrivacyLevel): string;
