import {Logger} from "tslog";

export const createLogger = (debug?: boolean): Logger<any>|undefined => {
    if(debug) {
        return new Logger({
            name: "react-token-auth"
        });
    }

    return undefined
};
