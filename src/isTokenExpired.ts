import { Maybe, TokenString } from './types';

// export const updateTokenOnExpiration = async (
//     token: TokenString,
//     onUpdate: (token: TokenString) => Promise<Maybe<TokenString>>,
// ) => (isTimestampExpired(jwtExp(token)) ? onUpdate(token) : token);

export const isTokenExpired = (token: TokenString) => isTimestampExpired(jwtExp(token));

const jwtExp = (token: string): number | null => {
    const split = token.split('.');

    if (split.length < 2) {
        return null;
    }

    try {
        const middlePart = Buffer.from(token.split('.')[1], 'base64').toString();
        const jwt = JSON.parse(middlePart);
        if (jwt && jwt.exp && Number.isFinite(jwt.exp)) {
            return jwt.exp * 1000;
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
};

const isTimestampExpired = (exp: Maybe<number>) => {
    if (!exp) {
        return false;
    }

    return Date.now() > exp;
};
