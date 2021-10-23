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
        const [isLogged, setIsLogged] = useState(false);

        const updateIsLoggedIn = () => {
            const session = getSessionState();
            if (onHydratation) {
                onHydratation(session);
            }
            setIsLogged(isLoggedIn(session));
        };

        useEffect(() => {
            updateIsLoggedIn();
        }, []);

        const listener = useCallback(() => {
            // setIsLogged(newIsLogged);
            updateIsLoggedIn();
        }, []);

        useEffect(() => {
            listenersContainer.subscribe(listener);
            return () => {
                listenersContainer.unsubscribe(listener);
            };
        }, [listener]);

        return [isLogged] as [typeof isLogged];
    };
};

const isLoggedIn = <T>(session: T) => !!session;
