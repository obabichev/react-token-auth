import { Maybe } from '../types';

export const createAuthFetch = (getAccessToken: () => Promise<Maybe<string>>, fetchFunction: typeof fetch) => {
    return async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
        const accessToken = await getAccessToken();

        init = init || {};

        if (accessToken) {
            init.headers = {
                ...init.headers,
                Authorization: `Bearer ${accessToken}`,
            };
        } else {
            // tslint:disable-next-line:no-console
            console.warn(
                "'authFetch' was called without access token. Probably storage has no session or session were expired",
            );
        }

        return fetchFunction(input, init);
    };
};
