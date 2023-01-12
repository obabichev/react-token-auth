import { isTokenExpired, jwtExp } from '../isTokenExpired';
import { createJWTTokenWithExp, getExpiredJWTToken, getNonExpiredJWTToken } from '../test-utils/jwt';

describe('isTokenExpired-jwt', () => {
    it('expired token', () => {
        const token = getExpiredJWTToken();

        expect(isTokenExpired(jwtExp(token))).toBeTruthy();
    });

    it('valid token', () => {
        const token = getNonExpiredJWTToken();

        expect(isTokenExpired(jwtExp(token))).toBeFalsy();
    });

    it('token expires in 1 second', () => {
        const token = createJWTTokenWithExp(Math.floor(Date.now() / 1000) + 1);

        expect(isTokenExpired(jwtExp(token), 5000)).toBeTruthy();
    });

    it('token expired 1 second ago', () => {
        const token = createJWTTokenWithExp(Math.floor(Date.now() / 1000) - 1);

        expect(isTokenExpired(jwtExp(token), 5000)).toBeTruthy();
    });

    it('hardcoded token is expired', () => {
        const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkpzYWRrZmphZGpraGZAcXdlcXdlcyIsInN1YiI6IjE1IiwiaWF0IjoxNjM3NzUxMjM5LCJleHAiOjE2Mzc3NTEyOTl9.ZjcVgbVvoZrIZHzjIckYgFwY5rnlyxlHGvGNHg_CRRk';
        expect(isTokenExpired(jwtExp(token), 5000)).toBeTruthy();
    });
});

describe('isTokenExpired-custom-time', () => {
    it('expired token', () => {
        expect(isTokenExpired(1000)).toBeTruthy();
    });

    it('valid token', () => {
        expect(isTokenExpired(Date.now() + 5000 * 1000)).toBeFalsy();
    });

    it('token expires in 1 second', () => {
        expect(isTokenExpired(Date.now() + 1, 5000)).toBeTruthy();
    });

    it('token expired 1 second ago', () => {
        expect(isTokenExpired(Date.now() - 1, 5000)).toBeTruthy();
    });
});
