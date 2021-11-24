import Mock = jest.Mock;
import { createAsyncAuthProvider } from '../index';
import { getExpiredJWTToken } from '../test-utils/jwt';
import { createAsyncTestStorage } from '../test-utils/storage';

interface TokensSession {
    accessToken: string;
    refreshToken: string;
}

describe('asyncAuthProvider', () => {
    const fetchFunction: Mock = jest.fn(() => Promise.resolve('test-fetch-result'));

    beforeEach(() => {
        fetchFunction.mockReset();
    });

    it('session should be empty after creating', () => {
        const storage = createAsyncTestStorage();
        const provider = createAsyncAuthProvider<TokensSession>({ storage, fetchFunction });

        const session = provider.getSessionState();

        expect(session).toEqual(null);
    });

    it('session should be taken from storage', async () => {
        const storageKey = 'test-key';
        const session: TokensSession = { accessToken: 'test-access-token', refreshToken: 'test-refresh-token' };
        const storage = createAsyncTestStorage({ [storageKey]: JSON.stringify(session) });
        const provider = createAsyncAuthProvider<TokensSession>({ storage, fetchFunction, storageKey });

        await provider.waitInit();
        const actualSession = provider.getSessionState();

        expect(actualSession).toEqual(session);
    });

    it('authFetch uses access token from session', async () => {
        const storageKey = 'test-key';
        const session: TokensSession = { accessToken: 'test-access-token', refreshToken: 'test-refresh-token' };
        const storage = createAsyncTestStorage({ [storageKey]: JSON.stringify(session) });
        const provider = createAsyncAuthProvider<TokensSession>({
            storage,
            fetchFunction,
            storageKey,
            getAccessToken: (s) => s.accessToken,
        });

        await provider.waitInit();
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
        const storage = createAsyncTestStorage({ [storageKey]: JSON.stringify(session) });
        const onUpdateToken = jest.fn(
            (): Promise<TokensSession> =>
                Promise.resolve({ accessToken: 'updated-access-token', refreshToken: 'updated-refresh-token' }),
        );
        const provider = createAsyncAuthProvider<TokensSession>({
            storage,
            fetchFunction,
            storageKey,
            getAccessToken: (s) => s.accessToken,
            onUpdateToken,
        });

        await provider.waitInit();
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

    it('getSession updates token if it is expired', async () => {
        const accessToken =
            'header.eyJlbWFpbCI6IlRlc3RAZ21haWwuY29tMiIsInN1YiI6IjEzIiwiaWF0IjoxNjM3NzQ3OTg3LCJleHAiOjE2Mzc3NDgwNDd9.sign';
        const storageKey = 'test-key';
        const session: TokensSession = { accessToken, refreshToken: 'test-refresh-token' };
        const storage = createAsyncTestStorage({ [storageKey]: JSON.stringify(session) });
        const onUpdateToken = jest.fn(
            (): Promise<TokensSession> =>
                Promise.resolve({ accessToken: 'updated-access-token', refreshToken: 'updated-refresh-token' }),
        );
        const provider = createAsyncAuthProvider<TokensSession>({
            storage,
            fetchFunction,
            storageKey,
            getAccessToken: (s) => s.accessToken,
            onUpdateToken,
            expirationThresholdMillisec: 1000,
        });
        await provider.waitInit();
        await provider.getSession();

        expect(onUpdateToken.mock.calls).toEqual([[session]]);
        expect(provider.getSessionState()).toEqual({
            accessToken: 'updated-access-token',
            refreshToken: 'updated-refresh-token',
        });
    });
});
