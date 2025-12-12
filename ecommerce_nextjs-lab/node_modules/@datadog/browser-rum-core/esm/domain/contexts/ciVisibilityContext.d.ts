import { type Configuration } from '@datadog/browser-core';
export declare const CI_VISIBILITY_TEST_ID_COOKIE_NAME = "datadog-ci-visibility-test-execution-id";
export interface CiTestWindow extends Window {
    Cypress?: {
        env: (key: string) => string | undefined;
    };
}
export type CiVisibilityContext = ReturnType<typeof startCiVisibilityContext>;
export declare function startCiVisibilityContext(configuration: Configuration, cookieObservable?: import("@datadog/browser-core").Observable<string | undefined>): {
    get: () => {
        test_execution_id: string;
    } | undefined;
    stop: () => void;
};
