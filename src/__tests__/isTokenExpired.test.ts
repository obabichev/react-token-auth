import { isTokenExpired } from '../isTokenExpired';
import { getExpiredJWTToken, getNonExpiredJWTToken } from '../test-utils/jwt';

describe('isTokenExpired', () => {
    it('expired token', () => {
        const token = getExpiredJWTToken();

        expect(isTokenExpired(token)).toBeTruthy();
    });

    it('valid token', () => {
        const token = getNonExpiredJWTToken();

        expect(isTokenExpired(token)).toBeFalsy();
    });
});
