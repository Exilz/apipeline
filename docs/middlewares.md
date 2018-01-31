# Middlewares

Just like for the other request options, **you can provide middlewares at the global level in your API options, at the service's definition level, or in the `options` parameter of the `fetch` method.**

You must provide an **array of promises**, like so : `(serviceDefinition: IAPIService, paths: IMiddlewarePaths, options: IFetchOptions) => any;`, please [take a look at the types](#types) to know more. You don't necessarily need to write asynchronous code in them, but they all must be promises.

Anything you will resolve in those promises will be merged into your request's options !

Here's a barebone example :

```javascript
const API_OPTIONS = {
    // ... all your api options
    middlewares: [exampleMiddleware],
};

async function exampleMiddleware (serviceDefinition, serviceOptions) {
  // This will be printed everytime you call a service
  console.log('You just fired a request for the path ' + serviceDefinition.path);
}
```

You can even make API calls in your middlewares. For instance, you might want to make sure the user is logged in into your API, or you might want to refresh its authentication token once in a while. Like so :

```javascript
const API_OPTIONS = {
    // ... all your api options
    middlewares: [authMiddleware]
}

async function authMiddleware (serviceDefinition, serviceOptions) {
    if (authToken && !tokenExpired) {
        // Our token is up-to-date, add it to the headers of our request
        return { headers: { 'X-Auth-Token': authToken } };
    }
    // Token is missing or outdated, let's fetch a new one
    try {
        // Assuming our login service's method is already set to 'POST'
        const authData = await api.fetch(
            'login',
            // the 'fetcthOptions' key allows us to use any of react-native's fetch method options
            // here, the body of our post request
            { fetchOptions: { body: 'username=user&password=password' } } 
        );
        // Store our new authentication token and add it to the headers of our request
        authToken = authData.authToken;
        tokenExpired = false;
        return { headers: { 'X-Auth-Token': authData.authToken } };
    } catch (err) {
        throw new Error(`Couldn't auth to API, ${err}`);
    }
}
```