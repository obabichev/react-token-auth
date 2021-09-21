import { useCallback, useEffect, useState } from 'react';
import { createDefaultStore } from './utils/defaultStore';

export interface IAuthProviderConfig<T> {
    accessTokenExpireKey?: string;
    accessTokenKey?: string;
    localStorageKey?: string;
    onUpdateToken?: (token: T) => Promise<T | null>;
    onHydratation?: (token: T | null) => void;
    storage?: {
        getItem: (key: string) => any;
        setItem: (key: string, value: any) => void;
        removeItem: (key: string) => void;
    };
    customFetch?: typeof fetch;
}

export const createAuthProvider = <T>({
    accessTokenExpireKey,
    accessTokenKey,
    localStorageKey = 'REACT_TOKEN_AUTH_KEY',
    onUpdateToken,
    onHydratation,
    storage = createDefaultStore({ [localStorageKey]: localStorage.getItem(localStorageKey) }),
    customFetch,
}: IAuthProviderConfig<T>) => {
    const tp = createTokenProvider({
        accessTokenExpireKey,
        accessTokenKey,
        localStorageKey,
        onUpdateToken,
        onHydratation,
        storage,
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

        if (customFetch) {
            return customFetch(input, init);
        }

        return fetch(input, init);
    };

    const useAuth = () => {
        const [isLogged, setIsLogged] = useState(tp.isLoggedIn());

        const listener = useCallback(
            (newIsLogged: boolean) => {
                setIsLogged(newIsLogged);
            },
            [setIsLogged],
        );

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
    localStorageKey: string;
    onUpdateToken?: (token: T) => Promise<T | null>;
    onHydratation?: (token: T | null) => void;
    storage: {
        getItem: (key: string) => any;
        setItem: (key: string, value: any) => void;
        removeItem: (key: string) => void;
    };
}

const createTokenProvider = <T>({
    localStorageKey,
    accessTokenKey,
    accessTokenExpireKey,
    onUpdateToken,
    onHydratation,
    storage,
}: ITokenProviderConfig<T>) => {
    let listeners: Array<(newLogged: boolean) => void> = [];

    const getTokenInternal = (): T | null => {
        const data = storage.getItem(localStorageKey);

        const token = (data && JSON.parse(data)) || null;

        return token as T;
    };

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
            return token[accessTokenExpireKey];
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
        const token = getTokenInternal();
        if (token && isExpired(getExpire(token))) {
            const newToken = onUpdateToken ? await onUpdateToken(token) : null;
            setToken(newToken);
        }
    };

    const getToken = async () => {
        await checkExpiry();

        if (accessTokenKey) {
            const token = getTokenInternal();
            // @ts-ignore
            return token && token[accessTokenKey];
        }

        return getTokenInternal();
    };

    const isLoggedIn = () => {
        const token = getTokenInternal();
        if (onHydratation) onHydratation(token);
        return !!token;
    };

    const setToken = (token: T | null) => {
        if (token) {
            storage.setItem(localStorageKey, JSON.stringify(token));
        } else {
            storage.removeItem(localStorageKey);
        }
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
