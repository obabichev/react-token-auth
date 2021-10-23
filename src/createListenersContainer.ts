export type Listener = () => void;

export interface IListenerContainer {
    subscribe: (listener: Listener) => void;
    unsubscribe: (listener: Listener) => void;
    notify: () => void;
}

export const createListenersContainer = (): IListenerContainer => {
    let listeners: Listener[] = [];

    const subscribe = (listener: Listener) => {
        listeners.push(listener);
    };

    const unsubscribe = (listener: (logged: boolean) => void) => {
        listeners = listeners.filter((l) => l !== listener);
    };

    const notify = () => {
        listeners.forEach((l) => l());
    };

    return { subscribe, unsubscribe, notify };
};
