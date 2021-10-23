export const getExpiredJWTToken = (body?: object) =>
    `XXXHEADERXXX.${Buffer.from(JSON.stringify({ ...body, exp: Math.floor(Date.now() / 1000) - 1000 })).toString(
        'base64',
    )}.XXXSIGNXXX`;

export const getNonExpiredJWTToken = (body?: object) =>
    `XXXHEADERXXX.${Buffer.from(JSON.stringify({ ...body, exp: Math.floor(Date.now() / 1000) + 1000 })).toString(
        'base64',
    )}.XXXSIGNXXX`;
