import { createListenersContainer } from '../createListenersContainer';

describe('listenerContainer', () => {
    it('test subscribe', () => {
        const container = createListenersContainer();
        const fn = jest.fn();

        container.subscribe(fn);
        container.notify();

        expect(fn.mock.calls).toEqual([[]]);
    });

    it('test unsubscribe', () => {
        const container = createListenersContainer();
        const fn = jest.fn();

        container.subscribe(fn);
        container.unsubscribe(fn);
        container.notify();

        expect(fn.mock.calls).toEqual([]);
    });
});
