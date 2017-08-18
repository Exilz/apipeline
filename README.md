# react-native-offline-api

Simple, customizable, offline-first API wrapper for react-native.

Easily write offline-first react-native applications with your own REST API. This module supports every major features for network requests : middlewares, fine-grained control over caching logic, custom caching driver...

## Table of contents

- [react-native-offline-api](#react-native-offline-api)
    - [Table of contents](#table-of-contents)
    - [Installation](#installation)
    - [How to use](#how-to-use)
        - [Setting up your global API options](#setting-up-your-global-api-options)
        - [Declaring your services definitions](#declaring-your-services-definitions)
        - [Firing your first request](#firing-your-first-request)
    - [Methods](#methods)
    - [API options](#api-options)
    - [Services options](#services-options)
    - [Fetch options](#fetch-options)
    - [Path and query parameters](#path-and-query-parameters)
    - [Middlewares](#middlewares)
    - [Using your own driver for caching](#using-your-own-driver-for-caching)
    - [Types](#types)
    - [Roadmap](#roadmap)

## Installation

```
npm install --save react-native-offline-api # with npm
yarn add react-native-offline-api # with yarn
```

## How to use

Since this plugin is a fully-fledged wrapper and not just a network helper, you need to set up your API configuration.

### Setting up your global API options

Here's an example :

```javascript
const API_OPTIONS = {
    domains: { default: 'http://myapi.tld', staging: 'http://staging.myapi.tld' },
    prefixes: { default: '/api/v1', apiV2: '/api/v2' },
    debugAPI: true,
    printNetworkRequests: true
};
```

Here, we have set up the wrapper so it can use 2 different domains, a production API (the default one) and a staging API.

We also have 2 different prefixes, so, if you're versioning your APIs by appending `/v2` in your URLs for example, you'll be able to easily request each versions. Please note that this is totally optional.

**[Check out all the API options here](#api-options)**

### Declaring your services definitions

From now on, **we'll call all your API's endpoint services**. Now that you have set up your options, you need to declare your services. Easy peasy :

```javascript
const API_SERVICES = {
  articles: {
    path: 'articles',
  },
  documents: {
    domain: 'staging',
    prefix: 'apiV2',
    path: 'documents/:documentId',
    disableCache: true
  },
  login: {
    path: 'login',
    method: 'POST',
    expiration: 5 * 60 * 1000
  }
};
```

Here, we declared 3 services :

* `articles` that will fetch data from `http://myapi.tld/api/v1/articles`
* `documents` that will fetch data from `http://staging.myapi.tld/api/v2/documents/:documentId` and won't cache anything
* `login` that will make a `POST` request on `http://myapi.tld/api/v1/login` with a 5 minutes caching

These are just examples, **there are much more options for your services, [check them out here](#services-options).**

### Firing your first request

Now that we have our API options and services configured, let's call our API !

```javascript
import React, { Component } from 'react';
import OfflineFirstAPI from 'react-native-offline-api';

// ... API and services configurations

const api = new OfflineFirstAPI(API_OPTIONS, API_SERVICES);

export default class demo extends Component {

    componentDidMount () {
        this.fetchSampleData();
    }

    async fetchSampleData () {
        try {
            const request = await api.fetch(
                'documents',
                {
                    pathParameters: { documentId: 'xSfdk21' }
                }
            );
            console.log('Our fetched document data', request);
        } catch (err) {
            // Handle any error
        }
    }

    render () {
        // ...
    }
}
```

In this short example, we're firing a `GET` request on the path `http://staging.myapi.tld/api/v2/documents/xSfdk21`. If you don't understand how this path is constructed, see [path and query parameters](#path-and-query-parameters).

A couple of notes :

* The `fetch` and `fetchHeaders` methods are promises, which means you can either use `async/await` or `fetch().then().catch()` if you prefer.
* You can instantiate `OfflineFirstAPI` without `API_OPTIONS` and/or `API_SERVICES` and set them later with `api.setOptions` and `api.setServices` methods if the need arises.

## Methods

Name | Description | Parameters | Return value
------ | ------ | ------ | ------
`fetch` | Fires a network request to one of your service with additional options, see [fetch options](#fetch-options) | `service: string, options?: IFetchOptions` | `Promise<any>`
`fetchHeaders` | Just like `fetch` but only returns the HTTP headers of the reponse | `service: string, options?: IFetchOptions` | `Promise<any>`
`clearCache` | Clears all the cache, or just the one of a specific service | `service?: string` | `Promise<void>`
`setOptions` | Sets or update the API options of the wrapper | `options: IAPIOptions` | `void`
`setServices` | Sets or update your services definitions | `services: IAPIServices` | `void`
`setCacheDriver` | Sets or update your custom cache driver, see [using your own driver for caching](#using-your-own-driver-for-caching)  | `driver: IAPIDriver` | `void`

## API options

These are the global options for the wrapper. Some of them can be overriden at the service definition level, or with the `option` parameter of the `fetch` method. **Only `domains` and `prefixes` are required.**

Key | Type | Description | Example
------ | ------ | ------ | ------
`domains` | `{ default: string, [key: string]: string }` | **Required**, full URL to your domains | `domains: {default: 'http://myapi.tld', staging: 'http://staging.myapi.tld' },`
`prefixes` | `{ default: string, [key: string]: string }` | **Required**, prefixes your API uses, `default` is required, leave it blank if you don't have any | `{ default: '/api/v1', apiV2: '/api/v2' }`
`middlewares` | `APIMiddleware[]` | Optionnal middlewares, see [middlewares](#middlewares) | `[authFunc, trackFunc]`
`debugAPI` | `boolean` | Optional, enables debugging mode, printing what's the wrapper doing
`printNetworkRequests` | `boolean` | Optional, prints all your network requests
`disableCache` | `boolean` | Optional, completely disables caching (overriden by service definitions & `fetch`'s `option` parameter)
`cacheExpiration` | `number` | Optional default expiration of cached data in ms (overriden by service definitions & `fetch`'s `option` parameter)
`offlineDriver` | `IAPIDriver` | Optional, see [use your own driver for caching](#use-your-own-driver-for-caching)

## Services options

These are the options for each of your services, **the only required key is `path`**. Default values are supplied for the others.

Key | Type | Description | Example
------ | ------ | ------ | ------
`path` | `string` | Required path to your endpoint, see [path and query parameters](#path-and-query-parameters) | `article/:articleId`
`expiration` | `number` | Optional time in ms before this service's cached data becomes stale, defaults to 5 minutes
`method` | `'GET' | 'POST' | 'OPTIONS'...` | Optional HTTP method of your request, defaults to `GET`
`domain` | `string` | Optional specific domain to use for this service, provide the key you set in your `domains` API option
`prefix` | `string` | Optional specific prefix to use for this service, provide the key you set in your `prefixes` API option
`middlewares` | `APIMiddleware[]` | Optional array of middlewares that override the ones set globally in your `middlewares` API option, , see [middlewares](#middlewares)
`disableCache` | `boolean` | Optional, disables the cache for this service (override your [API's global options](#api-options))

## Fetch options

The `options` parameter of the `fetch` and `fetchHeaders` method overrides the configuration you set globally in your API options, and the one you set for your services definitions. For instance, this is a good way of making very specific calls without having to declare another service just to tweak a single option.

Important notes : 

* All of these are optional.
* All the keys of [services options](#services-options) can be overriden here ! You could disable caching just for a single call for example, but still having it enabled in your service's definition.

Key | Type | Description | Example
------ | ------ | ------ | ------
`pathParameters` | `{ [key: string]: string }` | Parameters to replace in your path, see [path and query parameters](#path-and-query-parameters) | `{ documentId: 'xSfdk21' }`
`queryParameters` | `{ [key: string]: string }` | Query parameters that will be appended to your service's path, , see [path and query parameters](#path-and-query-parameters) | `{ refresh: true, orderBy: 'date' }`
`headers` | `{ [key: string]: string }` | HTTP headers you need to pass in your request
`middlewares` | `APIMiddleware[]` | Optional array of middlewares that override the ones set globally in your `middlewares` API option and in your service's definition, , see [middlewares](#middlewares)
`fetchOptions` | `any` | Optional, any value passed here will be merged into the options of react-native's `fetch` method so you'll be able to configure anything not provided by the wrapper itself

## Path and query parameters

The URL to your endpoints are being constructed with **your domain name, your optional prefix, and your optional `pathParameters` and `queryParameters`.**

* The `pathParameters` will replace the parameters in your service's path. For instance, a request fired with this path : `/documents/:documentId`, and these `pathParameters` : `{ documentId: 'xSfdk21' }` will become `/documents/xSfdk21`.

* The `queryParameters` are regular query string parameters. For instance, a request fired with this path : `/weather` and these `queryParameters` : `{ days: 'mon,tue,sun', location: 'Paris,France' }` will become `/weather?days=mon,tue,sun&location=Paris,France`.

## Middlewares

Just like for the other request options, **you can provide middlewares at the global level in your API options, at the service's definition level, or in the `options` parameter of the `fetch` method.**

You must provide an **array of promises**, like so : `(serviceDefinition: IAPIService, options: IFetchOptions) => any;`, please [take a look at the types](#types) to know more. You don't necessarily need to write asynchronous code in them, but they all must be promises.

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

## Using your own driver for caching

This wrapper has been written with the goal of **being storage-agnostic**. This means that by default, it will make use of react-native's `AsyncStorage` API, but feel free to write your own driver and use anything you want, like the amazing [realm](https://github.com/realm/realm-js) or [sqlite](https://github.com/andpor/react-native-sqlite-storage).

> This is the first step for the wrapper to being also available on the browser and in any node.js environment.

Your custom driver must implement these 3 methods that are promises.

* `getItem(key: string, callback?: (error?: Error, result?: string) => void)`
* `setItem(key: string, value: string, callback?: (error?: Error) => void);`
* `multiRemove(keys: string[], callback?: (errors?: Error[]) => void);`

*Please note that, as of the 1.0 release, this hasn't been tested thoroughly.*

## Types

Every API interfaces [can be seen here](src/interfaces.ts) so you don't need to poke around the parameters in your console to be aware of what's available to you :)

These are Typescript defintions, so they should be displayed in your editor/IDE if it supports it.

## Roadmap

Pull requests are more than welcome for these items, or for any feature that might be missing.

- [ ] Write a demo
- [ ] Thoroughly test custom caching drivers, maybe provide one (realm or sqlite)
- [ ] Add automated testing