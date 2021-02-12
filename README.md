# Disclaimer

I made this small library on my way of understanding authorization. I DON'T RECOMMEND TO USE THIS LIBRARY, because it may cause security issues. Storing auth tokens in the local storage is not safe, because any JavaScript code on the page has access to the local storage what makes your app vulnerable to different vectors of attacks (especially XSS).

# React Token Auth

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

## Examples

This library has typings for TypeScript code, but nothing prevents you from just 
remove types from the examples and use as a JavaScript code.

### Access and Refresh tokens 

Let's assume you have a backend that uses `accessToken` and `refreshToken` to auth 
users and provides services `/login`, `/register`, and `/update-token`.  All services 
return tokens in the next format: 

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

The first step you need to do is to create an instance of an `authProvider`.

```typescript
import {createAuthProvider} from 'react-token-auth';


export const [useAuth, authFetch, login, logout] =
    createAuthProvider<{ accessToken: string, refreshToken: string }>({
        accessTokenKey: 'accessToken',
        onUpdateToken: (token) => fetch('/update-token', {
            method: 'POST',
            body: token.refreshToken
        })
        .then(r => r.json())
    });
```

Field `accessTokenKey` helps the library to find access token in the 
whole tokens object.

If the access token may expire, you can provide parameter 
`accessTokenExpireKey` in the config to find expiration time. 
In the case of `JWT` token usage library will extract expiration 
time automatically.

If the access token is expired and `onUpdateToken` function is 
provided library will try to update the token.

Function `createAuthProvider` returns some new functions to interact with 
the token provider.

`login()` might be used to save a new token after successful authorization 
or registration. For example:

```typescript
const Login = () => {
    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        fetch('/login', {/**/})
            .then(r => r.json())
            .then(token => login(token));
    };
    
    return <form onSubmit={onSubmit}>
        {/**/}
    </form>
}
```

In the same way function `logout()` might be used to remove 
token and clean localStorage.

The hook `useAuth` might be used to get access to the auth from React 
component to render (and rerender) the app depending on the current 
auth state. For example:

```typescript
const Router = () => {
    const [logged] = useAuth();

    return <BrowserRouter>
        <Switch>
            {!logged && <>
                <Route path="/register" component={Register}/>
                <Route path="/login" component={Login}/>
                <Redirect to="/login"/>
            </>}
            {logged && <>
                <Route path="/dashboard" component={Dashboard} exact/>
                <Redirect to="/dashboard"/>
            </>}
        </Switch>
    </BrowserRouter>;
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
            dispatch(getUserAction(user);
        })
};
``` 

Also if the token already saved in the `localStorage`, it 
will be restored after refreshing the page.

That's it. The library has a minimal and straightforward API. 
If it doesn't match your specific requirements be free to write an 
issue, make a pull request, make fork or use the source code as an 
example or base for your solution.

## API

### `createAuthProvider(config)` -> `AuthProvider`

#### `config: IAuthProviderConfig<T>`

- `accessTokenExpireKey?: string` - key of the field with expiration date inside token
- `accessTokenKey?: string` - key of the field with access token (if not presented the whole token will be recognized as access token)
- `localStorageKey?: string = 'REACT_TOKEN_AUTH_KEY'` - key that will be used to store value in local storage
- `onUpdateToken?: (token: T) => Promise<T | null>` - function to update access token when it is expired
- `onHydratation?: (token: T | null) => void` - function to process your tokens when `useAuth` is called.
- `storage` - object that provides the api of the `localStorage` (`getItem`, `setItem`, `removeItem`) to store the data. By default the wrapper over `localStorage` is used.
- `customFetch` - you can provide you own `fetch` function. Added to be able to pass wrappers over standard fetch.

#### `AuthProvider: [useAuth, authFetch, login, logout]`

- `useAuth: () => [boolean]` - hook to get information is the user logged in or not
- `authFetch: typeof fetch` - wrapper around fetch to pass access tokens in the network requests
- `login: token => void` - function to save token (for example, after login or register)
- `logout: () => void` - function to remove token from auth provider (and from local storage) 
