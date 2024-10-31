export declare class BoundedBuffer<T = void> {
    private buffer;
    add(callback: (arg: T) => void): void;
    remove(callback: (arg: T) => void): void;
    drain(arg: T): void;
}
