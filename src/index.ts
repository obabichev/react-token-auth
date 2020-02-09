import { useEffect, useState } from 'react';

export interface IAuthProviderConfig<T> {
    accessTokenExpireKey?: string;
    accessTokenKey?: string;
    localStorageKey?: string;
    onUpdateToken?: (token: T) => Promise<T | null>;
}

export const createAuthProvider = <T>({
    accessTokenExpireKey,
    accessTokenKey,
    localStorageKey = 'REACT_TOKEN_AUTH_KEY',
    onUpdateToken,
}: IAuthProviderConfig<T>) => {
    const localStorageData = localStorage.getItem(localStorageKey);

    const tp = createTokenProvider({
        accessTokenExpireKey,
        accessTokenKey,
        initToken: (localStorageData && JSON.parse(localStorageData)) || null,
        localStorageKey,
        onUpdateToken,
    });

    const login = (newTokens: T) => {
        tp.setToken(newTokens);
    };

    const logout = () => {
        tp.setToken(null);
    };

    const authFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
        const token = await tp.getToken();

        init = init || {};

        init.headers = {
            ...init.headers,
            Authorization: `Bearer ${token}`,
        };

        return fetch(input, init);
    };

    const useAuth = () => {
        const [isLogged, setIsLogged] = useState(tp.isLoggedIn());

        const listener = (newIsLogged: boolean) => {
            setIsLogged(newIsLogged);
        };

        useEffect(() => {
            tp.subscribe(listener);
            return () => {
                tp.unsubscribe(listener);
            };
        }, [listener]);

        return [isLogged] as [typeof isLogged];
    };

    return [useAuth, authFetch, login, logout] as [typeof useAuth, typeof authFetch, typeof login, typeof logout];
};

interface ITokenProviderConfig<T> {
    accessTokenExpireKey?: string;
    accessTokenKey?: string;
    initToken: T | null;
    localStorageKey: string;
    onUpdateToken?: (token: T) => Promise<T | null>;
}

const createTokenProvider = <T>({
    initToken,
    localStorageKey,
    accessTokenKey,
    accessTokenExpireKey,
    onUpdateToken,
}: ITokenProviderConfig<T>) => {
    let privateToken = initToken;

    let listeners: Array<(newLogged: boolean) => void> = [];

    const subscribe = (listener: (logged: boolean) => void) => {
        listeners.push(listener);
    };

    const unsubscribe = (listener: (logged: boolean) => void) => {
        listeners = listeners.filter(l => l !== listener);
    };

    const jwtExp = (token?: any): number | null => {
        if (!(typeof token === 'string')) {
            return null;
        }

        const split = token.split('.');

        if (split.length < 2) {
            return null;
        }

        try {
            const jwt = JSON.parse(atob(token.split('.')[1]));
            if (jwt && jwt.exp && Number.isFinite(jwt.exp)) {
                return jwt.exp * 1000;
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    };

    const getExpire = (token: T | null) => {
        if (!token) {
            return null;
        }

        if (accessTokenExpireKey) {
            // @ts-ignore
            return token[accessTokenExpireField];
        }

        if (accessTokenKey) {
            // @ts-ignore
            const exp = jwtExp(token[accessTokenKey]);
            if (exp) {
                return exp;
            }
        }

        return jwtExp(token);
    };

    const isExpired = (exp?: number) => {
        if (!exp) {
            return false;
        }

        return Date.now() > exp;
    };

    const checkExpiry = async () => {
        if (privateToken && isExpired(getExpire(privateToken))) {
            const newToken = onUpdateToken ? await onUpdateToken(privateToken) : null;

            if (newToken) {
                privateToken = newToken;
            } else {
                localStorage.removeItem(localStorageKey);
                privateToken = null;
            }
        }
    };

    const getToken = async () => {
        await checkExpiry();

        if (accessTokenKey) {
            // @ts-ignore
            return privateToken[accessTokenKey];
        }

        return privateToken;
    };

    const isLoggedIn = () => {
        return !!privateToken;
    };

    const setToken = (token: T | null) => {
        if (token) {
            localStorage.setItem(localStorageKey, JSON.stringify(token));
        } else {
            localStorage.removeItem(localStorageKey);
        }
        privateToken = token;
        notify();
    };

    const notify = () => {
        const isLogged = isLoggedIn();
        listeners.forEach(l => l(isLogged));
    };

    return {
        getToken,
        isLoggedIn,
        setToken,
        subscribe,
        unsubscribe,
    };
};
