import { Maybe } from './types';
import {Logger} from "tslog";
import bufferFrom from 'buffer-from';

export const isTokenExpired = (exp: Maybe<number>, thresholdMillisec?: number, logger?: Logger<any>) => {
    logger?.debug('isTokenExpired', 'exp', exp);
    if (!exp) {
        return false;
    }

    logger?.debug('isTokenExpired', 'Date.now()', Date.now());
    logger?.debug('isTokenExpired', '(thresholdMillisec ?? 0', thresholdMillisec ?? 0);
    return Date.now() > exp - (thresholdMillisec ?? 0);
};

export const jwtExp = (token: string, logger?: Logger<any>): number | null => {
    const split = token.split('.');
    logger?.debug('jwtExp', 'split', split);

    if (split.length < 2) {
        return null;
    }

    try {
        const middlePart = bufferFrom(token.split('.')[1], 'base64').toString();
        logger?.debug('jwtExp', 'middlePart', middlePart);
        const jwt = JSON.parse(middlePart);
        logger?.debug('jwtExp', 'jwt', jwt);
        if (jwt && jwt.exp && Number.isFinite(jwt.exp)) {
            return jwt.exp * 1000;
        } else {
            return null;
        }
    } catch (e) {
        logger?.warn(e);
        return null;
    }
};
