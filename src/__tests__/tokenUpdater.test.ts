import { createTokenUpdater } from '../tokenUpdater';

describe('tokenUpdater', () => {
    it('onUpdateToken function should be called', async () => {
        const onUpdateToken = jest.fn(() => Promise.resolve(''));
        const updater = createTokenUpdater<string>(onUpdateToken);

        await updater.updateToken('test-session');

        expect(onUpdateToken.mock.calls).toEqual([['test-session']]);
    });

    it('onUpdateToken function called only once for two concurrent requests', async () => {
        const onUpdateToken = jest.fn(() => new Promise<string>((r) => setTimeout(() => r(''), 10)));
        const updater = createTokenUpdater<string>(onUpdateToken);

        await Promise.all([updater.updateToken('test-session'), updater.updateToken('test-session')]);

        expect(onUpdateToken.mock.calls).toEqual([['test-session']]);
    });

    it('onUpdateToken function called twice for two token updates', async () => {
        const onUpdateToken = jest.fn(() => new Promise<string>((r) => setTimeout(() => r(''), 10)));
        const updater = createTokenUpdater<string>(onUpdateToken);

        await Promise.all([updater.updateToken('test-session'), updater.updateToken('test-session')]);
        await Promise.all([updater.updateToken('test-session-2'), updater.updateToken('test-session-2')]);

        expect(onUpdateToken.mock.calls).toEqual([['test-session'], ['test-session-2']]);
    });
});
