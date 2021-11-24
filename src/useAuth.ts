import { useCallback, useEffect, useState } from 'react';
import { IListenerContainer } from './createListenersContainer';
import { Getter, Maybe } from './types';

export const createUseAuth = <Session>({
    getSessionState,
    onHydratation,
    listenersContainer,
}: {
    getSessionState: Getter<Maybe<Session>>;
    listenersContainer: IListenerContainer;
    onHydratation?: (session: Maybe<Session>) => void;
}) => {
    return () => {
        const [session, setSession] = useState<Maybe<Session>>(null);

        const updateIsLoggedIn = () => {
            const actualSession = getSessionState();
            if (onHydratation) {
                onHydratation(actualSession);
            }
            setSession(actualSession);
        };

        useEffect(() => {
            updateIsLoggedIn();
        }, []);

        const listener = useCallback(() => {
            updateIsLoggedIn();
        }, []);

        useEffect(() => {
            listenersContainer.subscribe(listener);
            return () => {
                listenersContainer.unsubscribe(listener);
            };
        }, [listener]);

        return [isLoggedIn(session), session] as [boolean, Maybe<Session>];
    };
};

const isLoggedIn = <T>(session: T) => !!session;
