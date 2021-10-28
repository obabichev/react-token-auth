export const getExpiredJWTToken = (body?: object) => createJWTTokenWithExp(Math.floor(Date.now() / 1000) - 1000, body);

export const getNonExpiredJWTToken = (body?: object) =>
    createJWTTokenWithExp(Math.floor(Date.now() / 1000) + 1000, body);

export const createJWTTokenWithExp = (exp: number, body?: object) =>
    `XXXHEADERXXX.${Buffer.from(JSON.stringify({ ...body, exp })).toString('base64')}.XXXSIGNXXX`;
