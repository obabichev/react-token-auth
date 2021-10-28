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
});
