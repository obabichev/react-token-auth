import { isTokenExpired } from '../isTokenExpired';
import { createJWTTokenWithExp, getExpiredJWTToken, getNonExpiredJWTToken } from '../test-utils/jwt';

describe('isTokenExpired', () => {
    it('expired token', () => {
        const token = getExpiredJWTToken();

        expect(isTokenExpired(token)).toBeTruthy();
    });

    it('valid token', () => {
        const token = getNonExpiredJWTToken();

        expect(isTokenExpired(token)).toBeFalsy();
    });

    it('token expires in 1 second', () => {
        const token = createJWTTokenWithExp(Math.floor(Date.now() / 1000) + 1);

        expect(isTokenExpired(token, 5000)).toBeTruthy();
    });

    it('token expired 1 second ago', () => {
        const token = createJWTTokenWithExp(Math.floor(Date.now() / 1000) - 1);

        expect(isTokenExpired(token, 5000)).toBeTruthy();
    });

    it('hardcoded token is expired', () => {
        const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkpzYWRrZmphZGpraGZAcXdlcXdlcyIsInN1YiI6IjE1IiwiaWF0IjoxNjM3NzUxMjM5LCJleHAiOjE2Mzc3NTEyOTl9.ZjcVgbVvoZrIZHzjIckYgFwY5rnlyxlHGvGNHg_CRRk';
        expect(isTokenExpired(token, 5000)).toBeTruthy();
    });
});
