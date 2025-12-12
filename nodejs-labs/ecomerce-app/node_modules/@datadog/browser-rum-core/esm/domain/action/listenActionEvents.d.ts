import type { RumConfiguration } from '../configuration';
export type MouseEventOnElement = PointerEvent & {
    target: Element;
};
export interface UserActivity {
    selection: boolean;
    input: boolean;
    scroll: boolean;
}
export interface ActionEventsHooks<ClickContext> {
    onPointerDown: (event: MouseEventOnElement) => ClickContext | undefined;
    onPointerUp: (context: ClickContext, event: MouseEventOnElement, getUserActivity: () => UserActivity) => void;
}
export declare function listenActionEvents<ClickContext>(configuration: RumConfiguration, { onPointerDown, onPointerUp }: ActionEventsHooks<ClickContext>): {
    stop: () => void;
};
