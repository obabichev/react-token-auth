import { Maybe, TokenString } from '../types';

export const extractAccessToken = <Session>(
    session: Maybe<Session>,
    getAccessToken?: (session: Session) => TokenString,
): Maybe<string> => {
    if (!session) {
        return null;
    }
    if (getAccessToken) {
        return getAccessToken(session);
    }
    if (typeof session !== 'string') {
        throw Error(
            "Access token can not be extracted. Either whole 'session' must be a string (access token only) or 'getAccessToken' function should be provided",
        );
    }
    return session;
};
