export const Base64 = {
    decode: (input: string): string => Buffer.from(input, "base64").toString()
};
