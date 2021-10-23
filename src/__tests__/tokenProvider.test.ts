import { createAsyncTokenProvider, createTokenProvider } from '../createTokenProvider';
import { createAsyncTestStorage, createTestStore } from '../test-utils/storage';

type TestToken = { token: string };

const TEST_STORAGE_KEY = 'TEST_STORAGE_KEY';

describe('CreateTokenProvider with sync storage', () => {
    it('check setting-getting value', async () => {
        const storage = createTestStore();
        const tp = createTokenProvider<TestToken>({ localStorageKey: TEST_STORAGE_KEY, storage });

        const token = 'new-value';
        tp.setToken({ token });

        expect(tp.getToken()).toEqual({ token });
    });

    it('tokenProvider returns existing value if were no setters', async () => {
        const storage = createTestStore({ [TEST_STORAGE_KEY]: '{"test": "value"}' });
        const tp = createTokenProvider<TestToken>({ localStorageKey: TEST_STORAGE_KEY, storage });

        expect(tp.getToken()).toEqual({ test: 'value' });
    });

    it('check async setting-getting value', async () => {
        const storage = createAsyncTestStorage();
        const tp = createAsyncTokenProvider<TestToken>({ localStorageKey: TEST_STORAGE_KEY, storage });

        const token = 'new-value';
        await tp.setToken({ token });

        expect(await tp.getToken()).toEqual({ token });
    });

    it('tokenProvider returns existing value if were no setters', async () => {
        const storage = createAsyncTestStorage({ [TEST_STORAGE_KEY]: '{"test": "value"}' });
        const tp = createAsyncTokenProvider<TestToken>({ localStorageKey: TEST_STORAGE_KEY, storage });

        expect(await tp.getToken()).toEqual({ test: 'value' });
    });

    // it('listener gets logged status after setToken(smth not null)', async () => {
    //     const storage = createTestStore();
    //     const tp = createTokenProvider<TestToken>({ localStorageKey: TEST_STORAGE_KEY, storage });
    //
    //     const listener = jest.fn();
    //
    //     tp.subscribe(listener);
    //     await tp.setToken({ token: 'test' });
    //
    //     expect(listener.mock.calls).toEqual([[true]]);
    // });
    //
    // it('listener gets unlogged status after setToken(null)', async () => {
    //     const storage = createTestStore();
    //     const tp = createTokenProvider<TestToken>({ localStorageKey: TEST_STORAGE_KEY, storage });
    //
    //     const listener = jest.fn();
    //
    //     tp.subscribe(listener);
    //     await tp.setToken(null);
    //
    //     expect(listener.mock.calls).toEqual([[false]]);
    // });

    // it('onUpdateToken is called in the case of expired JWT token', async () => {
    //     const token = { token: getExpiredJWTToken() };
    //     const onUpdate = jest.fn(async () => ({ token: 'test-updated-token' }));
    //     const storage = createTestStore({ [TEST_STORAGE_KEY]: JSON.stringify(token) });
    //     const tp = createTokenProvider<TestToken>({
    //         localStorageKey: TEST_STORAGE_KEY,
    //         storage,
    //         onUpdateToken: onUpdate,
    //         accessTokenKey: 'token',
    //     });
    //
    //     const updatedToken = await tp.getToken();
    //
    //     expect(onUpdate.mock.calls).toEqual([[token]]);
    //     expect(updatedToken).toEqual('test-updated-token');
    // });

    // it('onUpdateToken is not called in the case of non expired JWT token', async () => {
    //     const token = { token: getNonExpiredJWTToken() };
    //     const onUpdate = jest.fn();
    //     const storage = createTestStore({ [TEST_STORAGE_KEY]: JSON.stringify(token) });
    //     const tp = createTokenProvider<TestToken>({
    //         localStorageKey: TEST_STORAGE_KEY,
    //         storage,
    //         onUpdateToken: onUpdate,
    //         accessTokenKey: 'token',
    //     });
    //
    //     const updatedToken = await tp.getToken();
    //
    //     expect(onUpdate.mock.calls).toEqual([]);
    //     expect(updatedToken).toEqual(token.token);
    // });
});

describe('CreateTokenProvider with async storage', () => {});
