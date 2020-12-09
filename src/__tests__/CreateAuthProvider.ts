import { createAuthProvider } from '../index';

const createTestStore = (initData = {}) => {
    const data: any = initData;

    const getData = () => data;

    const getItem = (key: string) => {
        return data[key];
    };

    const setItem = (key: string, value: any) => {
        data[key] = value;
    };

    const removeItem = (key: string) => {
        delete data[key];
    };

    return { getItem, setItem, removeItem, getData };
};

describe('CreateAuthProvider', () => {
    it('Check that token is stored', () => {
        const storage = createTestStore();
        const [useAuth, authFetch, login, logout] = createAuthProvider({ storage });

        login('test token');

        expect(storage.getData()).toEqual({ REACT_TOKEN_AUTH_KEY: '"test token"' });
    });

    it('Check that token by key provided to token auth', async () => {
        const storage = createTestStore();
        const [useAuth, authFetch, login, logout] = createAuthProvider({
            accessTokenKey: 'testKey',
            //@ts-ignore
            customFetch: async (input, init) => {
                return {
                    input,
                    init,
                };
            },
            storage,
        });

        login({ testKey: 'token-value' });

        const response = await authFetch('');
        // @ts-ignore

        expect(response.init.headers.Authorization).toEqual('Bearer token-value');
    });
});
