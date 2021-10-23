import { Maybe } from './types';

export const createTokenUpdater = <Session>(onUpdateToken: (session: Session) => Promise<Maybe<Session>>) => {
    let updatingPromise: Maybe<Promise<Maybe<Session>>> = null;

    const updateToken = async (session: Session): Promise<Maybe<Session>> => {
        if (updatingPromise) {
            return updatingPromise;
        }
        updatingPromise = onUpdateToken(session).then((updatedSession) => {
            updatingPromise = null;
            return updatedSession;
        });
        return updatingPromise;
    };

    return { updateToken };
};
