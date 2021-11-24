export const createLogger = (debug?: boolean) => {
    const log = (name: string, message: string, ...objs: any[]) => {
        if (debug) {
            // tslint:disable-next-line:no-console
            console.log(`[react-token-auth]${name}::${message}`, ...objs.map((it) => JSON.stringify(it)));
        }
    };
    return {
        log,
    };
};
