export interface IAuthStorage {
    getItem: (key: string) => Maybe<string>;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
}

export interface IAsyncAuthStorage {
    getItem: (key: string) => Promise<Maybe<string>>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}

export type TokenString = string;

export type Getter<T> = () => T;
export type Setter<T> = (value: T) => void;
export type AsyncSetter<T> = (value: T) => Promise<void>;

export type Maybe<T> = T | null;
