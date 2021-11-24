# Disclaimer

In general, I would suggest using cookie sessions for web applications.
But still, you may have a case when you have to use JWT tokens and store them in the local storage,
here this library might be useful.
React Native is also a good reason for using such a library.

# React Token Auth (v2)

`npm install react-token-auth`

## Motivation

`react-token-auth` is a small library to manage token in the auth process.
It doesn't solve all the possible use cases but helps with the one of
the most common: when you have `accessToken` and `refreshToken`, you
need to store them in `localStorage` and update if necessary.

One of the problems with auth in React apps is that you need to keep in sync the
state of the app (for example fact that user has been logged in) and token in
the `localStorage`. Also, you need to be sure that the token you use in `fetch`
is valid.

## Features

- sync (localStorage) and async (React Native) storages
- updating tokens on expiration
- preventing concurrent token updates

## Examples

This library has typings for TypeScript code, but nothing prevents you from just
remove types from the examples and use as a JavaScript code.

### Access and Refresh tokens

Let's assume you have a backend that uses `accessToken` and `refreshToken` to auth
users and provides services `/login`, `/register`, and `/update-token`. All services
return tokens in the next format:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

The first step you need to do is to create an instance of an `authProvider`.

```typescript
import { createAuthProvider } from 'react-token-auth';

type Session = { accessToken: string; refreshToken: string };

export const { useAuth, authFetch, login, logout } = createAuthProvider<Session>({
    getAccessToken: session => session.accessToken,
    storage: localStorage,
    onUpdateToken: token =>
        fetch('/update-token', {
            method: 'POST',
            body: token.refreshToken,
        }).then(r => r.json()),
});
```

Parameter `getAccessToken` helps the library to find access token in the
whole session object.

If the access token is expired and `onUpdateToken` function is
provided library will try to update the token.

Function `createAuthProvider` returns some new functions to interact with
the token provider.

`login()` might be used to save a new token after successful authorization
or registration. For example:

```typescript jsx
const Login = () => {
    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        fetch('/login', {
            /**/
        })
            .then(r => r.json())
            .then(session => login(session));
    };

    return <form onSubmit={onSubmit}>{/**/}</form>;
};
```

In the same way function `logout()` might be used to remove
token and clean storage.

The hook `useAuth` might be used to get access to the auth from React
component to render (and rerender) the app depending on the current
auth state. For example:

```typescript jsx
const Router = () => {
    const [logged, session] = useAuth();

    return (
        <BrowserRouter>
            <Switch>
                {!logged && (
                    <>
                        <Route path="/register" component={Register} />
                        <Route path="/login" component={Login} />
                        <Redirect to="/login" />
                    </>
                )}
                {logged && (
                    <>
                        <Route path="/dashboard" component={Dashboard} exact />
                        <Redirect to="/dashboard" />
                    </>
                )}
            </Switch>
        </BrowserRouter>
    );
};
```

`onHydratation`, when provided, receives the token when `useAuth` is called, inside `onHydratation` you can extract any information you need from it.

And the function `authFetch()` is the wrapper for function `fetch()`.
`authFetch()` and fetch have the same API, but `authFetch` automatically
passes the token from token provider to the network requests. For example
from `thunk`:

```typescript
export const getUser = (userId: string) => (dispatch: Dispatch) => {
    authFetch(`/user/${userId}`)
        .then(r => r.json())
        .then(user => {
            dispatch(getUserAction(user));
        });
};
```

Also if the token already saved in the `localStorage`, it
will be restored after refreshing the page.

## API

### `createAuthProvider<Session>(config: IAuthProviderConfig<Session>)` -> `IAuthProvider<Session>`

#### `IAuthProviderConfig<Session>`

- `getAccessToken?: (session: Session) => TokenString` - function which allows to extract access token from the whole session object
- `storageKey?: string = 'REACT_TOKEN_AUTH_KEY'` - key that will be used to store value in local storage
- `onUpdateToken?: (session: Session) => Promise<Maybe<Session>>` - function to update access token when it is expired
- `onHydratation?: (session: Maybe<Session>) => void` - function to process your tokens when `useAuth` is called.
- `storage?: IAuthStorage` - object that provides the api of the `localStorage` (`getItem`, `setItem`, `removeItem`) to store the data. By default, the in-memory storage is used.
- `fetchFunction?: typeof fetch` - you can provide you own `fetch` function. Added to be able to pass wrappers over standard fetch.
- `expirationThresholdMillisec?: number; (default: 5000)` - if present the token will be updated `expirationThresholdMillisec` before it's expiration 

#### `IAuthProvider<Session>`

-   `useAuth: () => [boolean, Maybe<Session>]` - hook to get information is the user logged in or not
-   `authFetch: typeof fetch` - wrapper around fetch to pass access tokens in the network requests
-   `login: (session: Session) => void` - function to save token (for example, after login or register)
-   `logout: () => void` - function to remove token from auth provider (and from local storage)
-   `getSession: () => Promise<Maybe<Session>>` - returns updated session without other wrappers
-   `getSessionState: () => Maybe<Session>` - returns current state of the session without any updates

### `createAsyncAuthProvider<Session>(config: IAsyncAuthProviderConfig<Session>)` -> `IAsyncAuthProvider<Session>`

#### `IAsyncAuthProviderConfig<Session>`

- `getAccessToken?: (session: Session) => TokenString` - function which allows to extract access token from the whole session object
- `storageKey?: string = 'REACT_TOKEN_AUTH_KEY'` - key that will be used to store value in local storage
- `onUpdateToken?: (session: Session) => Promise<Maybe<Session>>` - function to update access token when it is expired
- `onHydratation?: (session: Maybe<Session>) => void` - function to process your tokens when `useAuth` is called.
- `storage?: IAsyncAuthStorage` - object that provides the async storage api
- `fetchFunction?: typeof fetch` - you can provide you own `fetch` function. Added to be able to pass wrappers over standard fetch.
- `expirationThresholdMillisec?: number; (default: 5000)` - if present the token will be updated `expirationThresholdMillisec` before it's expiration

#### `IAsyncAuthProvider<Session>`

-   `useAuth: () => [boolean, Maybe<Session>]` - hook to get information is the user logged in or not
-   `authFetch: typeof fetch` - wrapper around fetch to pass access tokens in the network requests
-   `login: (session: Session) => Promise<void>` - function to save token (for example, after login or register)
-   `logout: () => Promise<void>` - function to remove token from auth provider (and from local storage)
-   `getSession: () => Promise<Maybe<Session>>` - returns updated session without other wrappers
-   `getSessionState: () => Maybe<Session>` - returns current state of the session without any updates
-   `waitInit: () => Maybe<Promise<void>>` - wait the session obtaining from the async storage after provider creation

### Storage interfaces

```typescript
export interface IAuthStorage {
    getItem: (key: string) => Maybe<string>;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
}
```

```typescript
export interface IAsyncAuthStorage {
    getItem: (key: string) => Promise<Maybe<string>>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}
```
