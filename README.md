# APIPeline

Easily write offline-first react-native and web applications with your own REST API. This module supports every major features for network requests : middlewares, fine-grained control over caching logic, custom caching driver... and works in isomorphic (universal) environments.

## Table of contents

- [APIPeline](#apipeline)
    - [Table of contents](#table-of-contents)
    - [Installation](#installation)
    - [How it works](#how-it-works)
    - [How to use](#how-to-use)
        - [Setting up your global API options](#setting-up-your-global-api-options)
        - [Setting your fetch method](#setting-your-fetch-method)
        - [Declaring your services definitions](#declaring-your-services-definitions)
        - [Setting your cache driver](#setting-your-cache-driver)
        - [Firing your first request](#firing-your-first-request)
    - [Methods](#methods)
    - [API options](#api-options)
    - [Services options](#services-options)
    - [Fetch options](#fetch-options)
    - [Path and query parameters](#path-and-query-parameters)
    - [Limiting the size of your cache](#limiting-the-size-of-your-cache)
    - [Middlewares](#middlewares)
    - [Using your own driver for caching](#using-your-own-driver-for-caching)
    - [Types](#types)

## Installation

```
npm install --save apipeline # with npm
yarn add apipeline # with yarn
```

## How it works

<p align="center"><a href="http://i.imgur.com/SBm5Xhj.png"><img src="http://i.imgur.com/TO1sGZU.png"/></a></p>
<p align="center"><em>click to enlarge</em></p>

## How to use

Since this plugin is a fully-fledged wrapper and not just a network helper, you need to set up your API configuration.

### Setting up your global API options

Here's an example :

```javascript
const API_OPTIONS = {
    fetchMethod: yourFetchMethod, // documented below
    domains: { default: 'http://myapi.tld', staging: 'http://staging.myapi.tld' },
    prefixes: { default: '/api/v1', apiV2: '/api/v2' },
    debugAPI: true,
    printNetworkRequests: true
};
```

Here, we have set up the wrapper so it can use 2 different domains, a production API (the default one) and a staging API.

We also have 2 different prefixes, so, if you're versioning your APIs by appending `/v2` in your URLs for example, you'll be able to easily request each versions. Please note that this is totally optional.

**[Check out all the API options here](#api-options)**

### Setting your fetch method

Since you can use *apipeline* in any javascript environement (react—native / browsers / node.js), you need to tell the plugin which function it should use to fetch data.

You can use anything you want as long as it follows the [fetch specification](https://fetch.spec.whatwg.org/).

* When using `react-native` : it's easy, just use `fetch` which is defined globally
* On the browser : you can use `fetch` on the most recent browser or use a polyfill like [unfetch](https://www.npmjs.com/package/unfetch) or [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch)
* In node.js : you *need* a `fetch` polyfill like [node-fetch](https://www.npmjs.com/package/node-fetch)

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

### Setting your cache driver

This step is optional, but if you want the wrapper to handle all of the offline goodness for you, you have to tell the plugin which cache driver it should use.

In order to do that, just pass your driver as the 3rd argument of APIPeline when instantiating your api, or use `api.setCacheDriver`.

* When using `react-native`: you can import `AsyncStorage` or use the baked-in [sqlite driver](docs/custom-drivers.md#sqlite-driver)
* On the browser : the trusty [`localforage`](https://www.npmjs.com/package/localforage) plugin is usually a good choice
* In node.js : no cache driver has been written for now but we would gladly accept pull requests regarding this feature

Examples :

In `react-native` : 

```javascript
import { AsyncStorage } from 'react-native';
import APIpeline from 'apipeline';

const api = new APIPeline(API_OPTIONS, API_SERVICES, AsyncStorage);
```

In an isomorphic setting (next.js for instance): 

```javascript
import APIpeline from 'apipeline';
import clientFetch from 'unfetch';
import serverFetch from 'isomorphic-unfetch';
import localforage from 'localforage';

const isServer = typeof window === 'undefined';

// ... API and services configuration

const api = isServer ?
    new APIpeline(API_OPTIONS, API_SERVICES) :
    new APIpeline(API_OPTIONS, API_SERVICES, localforage);

export default api;
```

### Firing your first request

Now that we have our API options and services configured, let's call our API !

```javascript
import React, { Component } from 'react';
import APIpeline from 'apipeline';

// ... API and services configurations and instantiation

export default class demo extends Component {

    componentDidMount () {
        this.fetchSampleData();
    }

    async fetchSampleData () {
        try {
            const request = await api.get(
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

* The `get`, `post`, `fetch`, `fetchHeaders`... methods are promises, which means you can either use `async/await` or `get().then().catch()` if you prefer.
* You can instantiate `APIPeline` without `API_OPTIONS` and/or `API_SERVICES` and set them later with `api.setOptions` and `api.setServices` methods if the need arises.

## Methods

Name | Description | Parameters | Return value
------ | ------ | ------ | ------
`fetch` | Fires a network request to one of your service with additional options, see [fetch options](#fetch-options) | `service: string, options?: IFetchOptions` | `Promise<any>`
`get`, `post`, `head`... | Each HTTP method has a dedicated method that acts just like `fetch` | `service: string, options?: IFetchOptions` | `Promise<any>`
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
`responseMiddleware` | `ResponseMiddleware` | Optionnal middleware to alter your API responses, see [middlewares](#middlewares) | `alterFunction`
`debugAPI` | `boolean` | Optional, enables debugging mode, printing what's the wrapper doing
`printNetworkRequests` | `boolean` | Optional, prints all your network requests
`disableCache` | `boolean` | Optional, completely disables caching (overriden by service definitions & `fetch`'s `option` parameter)
`cacheExpiration` | `number` | Optional default expiration of cached data in ms (overriden by service definitions & `fetch`'s `option` parameter)
`cachePrefix` | `string` | Optional, prefix of the keys stored on your cache, defaults to `offlineApiCache`
`ignoreHeadersWhenCaching` | `boolean` | Optional, your requests will be cached independently from the headers you sent. Defaults to `false`
`capServices` | `boolean` | Optional, enable capping for every service, defaults to `false`, see [limiting the size of your cache](#limiting-the-size-of-your-cache)
`capLimit` | `number` | Optional quantity of cached items for each service, defaults to `50`, see [limiting the size of your cache](#limiting-the-size-of-your-cache)
`offlineDriver` | `IAPIDriver` | Optional, see [use your own driver for caching](#use-your-own-driver-for-caching)

## Services options

These are the options for each of your services, **the only required key is `path`**. Default values are supplied for the others.

Key | Type | Description | Example
------ | ------ | ------ | ------
`path` | `string` | Required path to your endpoint, see [path and query parameters](#path-and-query-parameters) | `article/:articleId`
`expiration` | `number` | Optional time in ms before this service's cached data becomes stale, defaults to 5 minutes
`method` | `GET` | Optional HTTP method of your request, defaults to `GET` | `OPTIONS...`
`domain` | `string` | Optional specific domain to use for this service, provide the key you set in your `domains` API option
`prefix` | `string` | Optional specific prefix to use for this service, provide the key you set in your `prefixes` API option
`middlewares` | `APIMiddleware[]` | Optional array of middlewares that override the ones set globally in your `middlewares` API option, see [middlewares](#middlewares)
`responseMiddleware` | `ResponseMiddleware` | Optionnal middleware to alter your API responses that override the one set globally in your `middlewares` API option, see [middlewares](#middlewares) | `alterFunction`
`disableCache` | `boolean` | Optional, disables the cache for this service (override your [API's global options](#api-options))
`capService` | `boolean` | Optional, enable or disable capping for this specific service, see [limiting the size of your cache](#limiting-the-size-of-your-cache)
`capLimit` | `number` | Optional quantity of cached items for this specific service, defaults to `50`, see [limiting the size of your cache](#limiting-the-size-of-your-cache)
`ignoreHeadersWhenCaching` | `boolean` | Optional, your requests will be cached independently from the headers you sent. Defaults to `false`
`rawData` | `boolean` | Disables JSON parsing from your network requests, useful if you want to fetch XML or anything else from your api

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
`responseMiddleware` | `ResponseMiddleware` | Optionnal middleware to alter your API responses that override the one set globally in your `middlewares` API option and in your service's definition, see [middlewares](#middlewares) | `alterFunction`
`fetchOptions` | `any` | Optional, any value passed here will be merged into the options of react-native's `fetch` method so you'll be able to configure anything not provided by the wrapper itself

## Path and query parameters

The URL to your endpoints are being constructed with **your domain name, your optional prefix, and your optional `pathParameters` and `queryParameters`.**

* The `pathParameters` will replace the parameters in your service's path. For instance, a request fired with this path : `/documents/:documentId`, and these `pathParameters` : `{ documentId: 'xSfdk21' }` will become `/documents/xSfdk21`.

* The `queryParameters` are regular query string parameters. For instance, a request fired with this path : `/weather` and these `queryParameters` : `{ days: 'mon,tue,sun', location: 'Paris,France' }` will become `/weather?days=mon,tue,sun&location=Paris,France`.

> 💡 Pro-tip : Both query and path parameters can be undefined, in this case they simply won't be processed when generating your route. You don't have to create an intermediate variable holding your options to handle whether or not your variables are defined.

## Limiting the size of your cache

[Learn more about enabling capping in the documentation](docs/cache-size.md)

## Middlewares

[Check out middlewares documentation and examples](docs/middlewares.md)

## Using your own driver for caching

> 💡 You can now use SQLite instead of AsyncStorage without additional code !

[Check out drivers documentation and how to enable the SQLite driver](docs/custom-drivers.md)

## Types

Every API interfaces [can be seen here](src/interfaces.ts) so you don't need to poke around the parameters in your console to be aware of what's available to you :)

> 💡 These are Typescript defintions, so they should be displayed in your editor/IDE if it supports it.