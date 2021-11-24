import { createListenersContainer } from './createListenersContainer';
import { createTokenProvider } from './createTokenProvider';
import { isTokenExpired } from './isTokenExpired';
import { createTokenUpdater } from './tokenUpdater';
import { Getter, IAuthStorage, Maybe, TokenString } from './types';
import { createUseAuth } from './useAuth';
import { createAuthFetch } from './utils/createAuthFetch';
import { createDefaultStore } from './utils/defaultStore';
import { extractAccessToken } from './utils/extractAccessToken';

export interface IAuthProviderConfig<Session> {
    getAccessToken?: (session: Session) => TokenString;
    storageKey?: string;
    onUpdateToken?: (session: Session) => Promise<Maybe<Session>>;
    onHydratation?: (session: Maybe<Session>) => void;
    storage?: IAuthStorage;
    fetchFunction?: typeof fetch;
    expirationThresholdMillisec?: number;
}

export interface IAuthProvider<Session> {
    useAuth: () => [boolean, Maybe<Session>];
    authFetch: typeof fetch;
    login: (session: Session) => void;
    logout: () => void;
    getSession: () => Promise<Maybe<Session>>;
    getSessionState: () => Maybe<Session>;
}

export const createAuthProvider = <Session>({
    storageKey = 'REACT_TOKEN_AUTH_KEY',
    onUpdateToken,
    onHydratation,
    storage = createDefaultStore({ [storageKey]: localStorage.getItem(storageKey) }),
    fetchFunction = fetch,
    getAccessToken,
    expirationThresholdMillisec = 5000,
}: IAuthProviderConfig<Session>): IAuthProvider<Session> => {
    const listenersContainer = createListenersContainer();
    const tokenProvider = createTokenProvider<Session>({
        storageKey,
        storage,
    });
    const tokenUpdater = onUpdateToken && createTokenUpdater(onUpdateToken);

    let _session: Maybe<Session> = tokenProvider.getToken();

    const updateSession = (session: Maybe<Session>) => {
        tokenProvider.setToken(session);
        _session = session;
        listenersContainer.notify();
    };

    const login = (session: Session) => updateSession(session);

    const logout = () => updateSession(null);

    const getSessionState: Getter<Maybe<Session>> = () => _session;

    const getSession = async () => {
        const accessToken = extractAccessToken(getSessionState(), getAccessToken);

        if (_session && tokenUpdater && accessToken && isTokenExpired(accessToken, expirationThresholdMillisec)) {
            const updatedSession = await tokenUpdater.updateToken(_session);
            updateSession(updatedSession);
        }

        return getSessionState();
    };

    const authFetch = createAuthFetch(
        async () => extractAccessToken(await getSession(), getAccessToken),
        fetchFunction,
    );

    const useAuth = createUseAuth({
        getSessionState,
        onHydratation,
        listenersContainer,
    });

    return {
        useAuth,
        authFetch,
        login,
        logout,
        getSession,
        getSessionState,
    };
};
