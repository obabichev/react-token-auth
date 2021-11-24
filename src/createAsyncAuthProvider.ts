import { createListenersContainer } from './createListenersContainer';
import { createAsyncTokenProvider } from './createTokenProvider';
import { isTokenExpired } from './isTokenExpired';
import { createLogger } from './logger';
import { createTokenUpdater } from './tokenUpdater';
import { Getter, IAsyncAuthStorage, Maybe, TokenString } from './types';
import { createUseAuth } from './useAuth';
import { createAuthFetch } from './utils/createAuthFetch';
import { createDefaultAsyncStore } from './utils/defaultStore';
import { extractAccessToken } from './utils/extractAccessToken';

export interface IAsyncAuthProviderConfig<Session> {
    getAccessToken?: (session: Session) => TokenString;
    storageKey?: string;
    onUpdateToken?: (session: Session) => Promise<Maybe<Session>>;
    onHydratation?: (session: Maybe<Session>) => void;
    storage?: IAsyncAuthStorage;
    fetchFunction?: typeof fetch;
    expirationThresholdMillisec?: number;
    debug?: boolean;
}

export interface IAsyncAuthProvider<Session> {
    useAuth: () => [boolean, Maybe<Session>];
    authFetch: typeof fetch;
    login: (session: Session) => Promise<void>;
    logout: () => Promise<void>;
    getSession: () => Promise<Maybe<Session>>;
    getSessionState: () => Maybe<Session>;
    waitInit: () => Maybe<Promise<void>>;
}

export const createAsyncAuthProvider = <Session>({
    storageKey = 'REACT_TOKEN_AUTH_KEY',
    onUpdateToken,
    onHydratation,
    storage = createDefaultAsyncStore({ [storageKey]: localStorage.getItem(storageKey) }),
    fetchFunction = fetch,
    getAccessToken,
    expirationThresholdMillisec = 5000,
    debug = false,
}: IAsyncAuthProviderConfig<Session>): IAsyncAuthProvider<Session> => {
    const logger = createLogger(debug);
    const listenersContainer = createListenersContainer();

    const tokenProvider = createAsyncTokenProvider<Session>({
        storageKey,
        storage,
    });

    const tokenUpdater = onUpdateToken && createTokenUpdater(onUpdateToken);

    let _session: Maybe<Session> = null;
    const updateSession = async (session: Maybe<Session>) => {
        logger.log('updateSession', 'session', session);
        await tokenProvider.setToken(session);
        _session = session;
        listenersContainer.notify();
    };

    let initiationPromise: Maybe<Promise<void>> = tokenProvider
        .getToken()
        .then(updateSession)
        .then(() => {
            initiationPromise = null;
        })
        // tslint:disable-next-line:no-console
        .catch(console.error);

    const waitInit = () => initiationPromise;

    const login = (session: Session) => updateSession(session);

    const logout = () => updateSession(null);

    const getSessionState: Getter<Maybe<Session>> = () => _session;

    const getSession = async () => {
        const accessToken = extractAccessToken(getSessionState(), getAccessToken);
        logger.log('getSession', 'accessToken', accessToken);
        logger.log('getSession', 'tokenUpdater', tokenUpdater);
        if (accessToken) {
            logger.log(
                'getSession',
                'isTokenExpired(accessToken, expirationThresholdMillisec)',
                isTokenExpired(accessToken, expirationThresholdMillisec, logger),
            );
        }

        if (_session && tokenUpdater && accessToken && isTokenExpired(accessToken, expirationThresholdMillisec)) {
            const updatedSession = await tokenUpdater.updateToken(_session);
            logger.log('getSession', 'updatedSession', accessToken);
            await updateSession(updatedSession);
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
        waitInit,
    };
};
