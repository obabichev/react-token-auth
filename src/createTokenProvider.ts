import { AsyncSetter, IAsyncAuthStorage, IAuthStorage, Maybe, Setter } from './types';

export interface ITokenProviderConfig<T> {
    localStorageKey: string;
    storage: IAuthStorage;
}

export interface ITokenProvider<T> {
    getToken: () => Maybe<T>;
    setToken: (token: Maybe<T>) => void;
}

export const createTokenProvider = <T>({ localStorageKey, storage }: ITokenProviderConfig<T>): ITokenProvider<T> => {
    const parseToken = (data: Maybe<string>) => (data && JSON.parse(data)) || null;
    const decodeToken = (token: T) => JSON.stringify(token);

    const getToken = (): Maybe<T> => {
        return parseToken(storage.getItem(localStorageKey));
    };

    const setToken: Setter<Maybe<T>> = (token: T | null) => {
        return token ? storage.setItem(localStorageKey, decodeToken(token)) : storage.removeItem(localStorageKey);
    };

    return {
        getToken,
        setToken,
    };
};

export interface IAsyncTokenProviderConfig<T> {
    localStorageKey: string;
    storage: IAsyncAuthStorage;
}

export interface IAsyncTokenProvider<T> {
    getToken: () => Promise<Maybe<T>>;
    setToken: (token: Maybe<T>) => Promise<void>;
}

export const createAsyncTokenProvider = <T>({
    localStorageKey,
    storage,
}: IAsyncTokenProviderConfig<T>): IAsyncTokenProvider<T> => {
    const parseToken = (data: Maybe<string>) => (data && JSON.parse(data)) || null;
    const decodeToken = (token: T) => JSON.stringify(token);

    const getToken = async (): Promise<Maybe<T>> => {
        return parseToken(await storage.getItem(localStorageKey));
    };

    const setToken: AsyncSetter<Maybe<T>> = async (token: Maybe<T>) => {
        return token ? storage.setItem(localStorageKey, decodeToken(token)) : storage.removeItem(localStorageKey);
    };

    return {
        getToken,
        setToken,
    };
};
