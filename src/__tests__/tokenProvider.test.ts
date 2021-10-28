import { createAsyncTokenProvider, createTokenProvider } from '../createTokenProvider';
import { createAsyncTestStorage, createTestStore } from '../test-utils/storage';

type TestToken = { token: string };

const TEST_STORAGE_KEY = 'TEST_STORAGE_KEY';

describe('CreateTokenProvider with sync storage', () => {
    it('check setting-getting value', async () => {
        const storage = createTestStore();
        const tp = createTokenProvider<TestToken>({ storageKey: TEST_STORAGE_KEY, storage });

        const token = 'new-value';
        tp.setToken({ token });

        expect(tp.getToken()).toEqual({ token });
    });

    it('tokenProvider returns existing value if were no setters', async () => {
        const storage = createTestStore({ [TEST_STORAGE_KEY]: '{"test": "value"}' });
        const tp = createTokenProvider<TestToken>({ storageKey: TEST_STORAGE_KEY, storage });

        expect(tp.getToken()).toEqual({ test: 'value' });
    });

    it('check async setting-getting value', async () => {
        const storage = createAsyncTestStorage();
        const tp = createAsyncTokenProvider<TestToken>({ storageKey: TEST_STORAGE_KEY, storage });

        const token = 'new-value';
        await tp.setToken({ token });

        expect(await tp.getToken()).toEqual({ token });
    });

    it('tokenProvider returns existing value if were no setters', async () => {
        const storage = createAsyncTestStorage({ [TEST_STORAGE_KEY]: '{"test": "value"}' });
        const tp = createAsyncTokenProvider<TestToken>({ storageKey: TEST_STORAGE_KEY, storage });

        expect(await tp.getToken()).toEqual({ test: 'value' });
    });
});
