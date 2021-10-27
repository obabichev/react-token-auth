import { AsyncSetter, IAsyncAuthStorage, IAuthStorage, Maybe, Setter } from './types';

export interface ITokenProviderConfig<T> {
    storageKey: string;
    storage: IAuthStorage;
}

export interface ITokenProvider<T> {
    getToken: () => Maybe<T>;
    setToken: (token: Maybe<T>) => void;
}

export const createTokenProvider = <T>({ storageKey, storage }: ITokenProviderConfig<T>): ITokenProvider<T> => {
    const parseToken = (data: Maybe<string>) => (data && JSON.parse(data)) || null;
    const decodeToken = (token: T) => JSON.stringify(token);

    const getToken = (): Maybe<T> => {
        return parseToken(storage.getItem(storageKey));
    };

    const setToken: Setter<Maybe<T>> = (token: T | null) => {
        return token ? storage.setItem(storageKey, decodeToken(token)) : storage.removeItem(storageKey);
    };

    return {
        getToken,
        setToken,
    };
};

export interface IAsyncTokenProviderConfig<T> {
    storageKey: string;
    storage: IAsyncAuthStorage;
}

export interface IAsyncTokenProvider<T> {
    getToken: () => Promise<Maybe<T>>;
    setToken: (token: Maybe<T>) => Promise<void>;
}

export const createAsyncTokenProvider = <T>({
    storageKey,
    storage,
}: IAsyncTokenProviderConfig<T>): IAsyncTokenProvider<T> => {
    const parseToken = (data: Maybe<string>) => (data && JSON.parse(data)) || null;
    const decodeToken = (token: T) => JSON.stringify(token);

    const getToken = async (): Promise<Maybe<T>> => {
        return parseToken(await storage.getItem(storageKey));
    };

    const setToken: AsyncSetter<Maybe<T>> = async (token: Maybe<T>) => {
        return token ? storage.setItem(storageKey, decodeToken(token)) : storage.removeItem(storageKey);
    };

    return {
        getToken,
        setToken,
    };
};
