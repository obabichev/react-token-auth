import { createAuthProvider } from '../index';
import { getExpiredJWTToken } from '../test-utils/jwt';
import { createTestStore } from '../test-utils/storage';
import Mock = jest.Mock;

interface TokensSession {
    accessToken: string;
    refreshToken: string;
}

describe('authProvider with TokenSession', () => {
    const fetchFunction: Mock = jest.fn(() => Promise.resolve('test-fetch-result'));

    beforeEach(() => {
        fetchFunction.mockReset();
    });

    it('session should be empty after creating', () => {
        const storage = createTestStore();
        const provider = createAuthProvider<TokensSession>({ storage, fetchFunction });

        const session = provider.getSessionState();

        expect(session).toEqual(null);
    });

    it('session should be taken from storage', () => {
        const storageKey = 'test-key';
        const session: TokensSession = { accessToken: 'test-access-token', refreshToken: 'test-refresh-token' };
        const storage = createTestStore({ [storageKey]: JSON.stringify(session) });
        const provider = createAuthProvider<TokensSession>({ storage, fetchFunction, storageKey });

        const actualSession = provider.getSessionState();

        expect(actualSession).toEqual(session);
    });

    it('authFetch uses access token from session', async () => {
        const storageKey = 'test-key';
        const session: TokensSession = { accessToken: 'test-access-token', refreshToken: 'test-refresh-token' };
        const storage = createTestStore({ [storageKey]: JSON.stringify(session) });
        const provider = createAuthProvider<TokensSession>({
            storage,
            fetchFunction,
            storageKey,
            getAccessToken: (s) => s.accessToken,
        });

        await provider.authFetch('/test');

        expect(fetchFunction.mock.calls).toEqual([
            [
                '/test',
                {
                    headers: {
                        Authorization: 'Bearer test-access-token',
                    },
                },
            ],
        ]);
    });

    it('authFetch updates token if it is expired', async () => {
        const storageKey = 'test-key';
        const accessToken = getExpiredJWTToken();
        const session: TokensSession = { accessToken, refreshToken: 'test-refresh-token' };
        const storage = createTestStore({ [storageKey]: JSON.stringify(session) });
        const onUpdateToken = jest.fn(
            (): Promise<TokensSession> =>
                Promise.resolve({ accessToken: 'updated-access-token', refreshToken: 'updated-refresh-token' }),
        );
        const provider = createAuthProvider<TokensSession>({
            storage,
            fetchFunction,
            storageKey,
            getAccessToken: (s) => s.accessToken,
            onUpdateToken,
        });

        await provider.authFetch('/test');

        expect(onUpdateToken.mock.calls).toEqual([[session]]);
        expect(fetchFunction.mock.calls).toEqual([
            [
                '/test',
                {
                    headers: {
                        Authorization: 'Bearer updated-access-token',
                    },
                },
            ],
        ]);
    });
});
