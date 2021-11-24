import { SimpleLogger } from './logger';
import { Maybe, TokenString } from './types';
import { Base64 } from './utils/base64';

export const isTokenExpired = (token: TokenString, thresholdMillisec?: number, logger?: SimpleLogger) =>
    isTimestampExpired(jwtExp(token, logger), thresholdMillisec, logger);

const jwtExp = (token: string, logger?: SimpleLogger): number | null => {
    const split = token.split('.');
    logger?.log('jwtExp', 'split', split);

    if (split.length < 2) {
        return null;
    }

    try {
        const middlePart = Base64.decode(token.split('.')[1]);
        logger?.log('jwtExp', 'middlePart', middlePart);
        const jwt = JSON.parse(middlePart);
        logger?.log('jwtExp', 'jwt', jwt);
        if (jwt && jwt.exp && Number.isFinite(jwt.exp)) {
            return jwt.exp * 1000;
        } else {
            return null;
        }
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.warn(e);
        return null;
    }
};

const isTimestampExpired = (exp: Maybe<number>, thresholdMillisec?: number, logger?: SimpleLogger) => {
    logger?.log('isTimestampExpired', 'exp', exp);
    if (!exp) {
        return false;
    }

    logger?.log('isTimestampExpired', 'Date.now()', Date.now());
    logger?.log('isTimestampExpired', '(thresholdMillisec ?? 0', thresholdMillisec ?? 0);
    return Date.now() > exp - (thresholdMillisec ?? 0);
};
