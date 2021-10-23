import { Maybe } from '../types';

export type StoreData = { [key in string]: Maybe<string> };

export const createTestStore = (initData: StoreData = {}) => {
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

export const createAsyncTestStorage = (initData = {}) => {
    const data: any = initData;

    const getData = () => data;

    const getItem = async (key: string) => {
        return data[key];
    };

    const setItem = async (key: string, value: any) => {
        data[key] = value;
    };

    const removeItem = async (key: string) => {
        delete data[key];
    };

    return { getItem, setItem, removeItem, getData };
};
