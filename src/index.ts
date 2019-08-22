import sqliteDriver from './drivers/sqlite';
import * as _mapValues from 'lodash.mapvalues';
import * as _merge from 'lodash.merge';
import * as sha from 'jssha';
import {
    IAPIOptions,
    IAPIService,
    IAPIServices,
    IFetchOptions,
    IFetchResponse,
    ICachedData,
    ICacheDictionary,
    IAPICacheDriver,
    APIMiddleware,
    IMiddlewarePaths,
    IHTTPMethods
} from './interfaces';

const DEFAULT_API_OPTIONS = {
    debugAPI: false,
    prefixes: { default: '/' },
    encodeParameters: false,
    printNetworkRequests: false,
    disableCache: false,
    cacheExpiration: 5 * 60 * 1000,
    cachePrefix: 'APIPelineCache',
    ignoreHeadersWhenCaching: false,
    capServices: false,
    capLimit: 50,
};

const DEFAULT_SERVICE_OPTIONS: IAPIService = {
    method: 'GET',
    domain: 'default',
    prefix: 'default'
};

const HTTP_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'];

export const drivers = { sqliteDriver };
export default class APIpeline {

    private _APIOptions: IAPIOptions;
    private _APIServices: IAPIServices = {};
    private _APICacheDriver: IAPICacheDriver;
    private _warnedAboutMissingDriver: boolean = false;

    constructor (options: IAPIOptions, services: IAPIServices, driver?: IAPICacheDriver) {
        options && this.setOptions(options);
        services && this.setServices(services);
        driver && this.setCacheDriver(driver);

        this._createHTTPMethods();

        if (!this._APIOptions.fetchMethod) {
            throw new Error(
                'Your fetch method is undefined. make sure to set `fetchMethod` in your API options. ' +
                'Check out the documentation to find setting examples for the browser / node / react-native'
            );
        }
    }

    public async fetch (service: string, options?: IFetchOptions, forcedHTTPMethod?: IHTTPMethods): Promise<any> {
        const serviceDefinition: IAPIService = this._APIServices[service];
        if (!serviceDefinition) {
            throw new Error(`Cannot fetch data from unregistered service '${service}'`);
        }
        if (!this._APICacheDriver && !this._warnedAboutMissingDriver) {
            this._log(
                'No caching driver set. Remember set it as the 3rd argument of APIPeline ' +
                'or use the `setCacheDriver` method before firing requests. Nothing will be cached for now.'
            );
            this._warnedAboutMissingDriver = true;
        }
        const { fullPath, withoutQueryParams } = this._constructPath(serviceDefinition, options);

        try {
            const middlewares = await this._applyMiddlewares(
                serviceDefinition,
                { fullPath, withoutQueryParams },
                options
            );
            const fetchOptions = _merge(
                middlewares,
                (options && options.fetchOptions) || {},
                { method: forcedHTTPMethod || serviceDefinition.method },
                { headers: (options && options.headers) || {} }
            );
            const fetchHeaders = options && options.fetchHeaders;
            const shouldUseCache = this._shouldUseCache(serviceDefinition, options);
            let expiration;
            let requestId;
            if (shouldUseCache) {
                requestId = this._buildRequestId(serviceDefinition, fullPath, fetchHeaders, fetchOptions, options);

                // Expiration priority : option parameter of fetch() > service definition > default setting
                const expirationDelay =
                    (options && options.expiration) || serviceDefinition.expiration || this._APIOptions.cacheExpiration;
                expiration = Date.now() + expirationDelay;
            }
            const cachedData = await this._getCachedData(service, requestId, fullPath, shouldUseCache);

            if ((!this._APIOptions.networkFirst && !options.networkFirst && !serviceDefinition.networkFirst) && cachedData.success && cachedData.fresh) {
                this._log(`Using fresh cache for ${fullPath}`);
                return cachedData.data;
            }

            // Network fetch
            this._logNetwork(serviceDefinition, fullPath, fetchHeaders, options, forcedHTTPMethod);
            this._log('full URL for request', fullPath);
            this._log('full fetch options for request', fetchOptions);
            let parsedResponseData;
            const res = await this._fetch(fullPath, fetchOptions);

            // If the network request fails, return the cached data if it's valid, a throw an error
            if (!res.success) {
                if (cachedData.success && cachedData.data) {
                    this._log(`Using ${cachedData.fresh ? 'fresh' : 'stale'} cache for ${fullPath} (network request failed)`);
                    return cachedData.data;
                } else {
                    throw new Error(`Cannot fetch data for ${service} online, no cache either.`);
                }
            }

            this._log('raw network response', res);
            if (fetchHeaders) {
                parsedResponseData = res.data.headers && res.data.headers.map ? res.data.headers.map : {};
            } else {
                parsedResponseData = (options && options.rawData) || serviceDefinition.rawData ?
                    res.data :
                    await res.data.json();

                const responseMiddleware =
                    (options && options.responseMiddleware) ||
                    serviceDefinition.responseMiddleware ||
                    this._APIOptions.responseMiddleware;

                if (responseMiddleware) {
                    parsedResponseData = await responseMiddleware(parsedResponseData);
                }
            }

            // Cache if it hasn't been disabled and if the network request has been successful
            if (res.data.ok && shouldUseCache) {
                this._cache(serviceDefinition, service, requestId, parsedResponseData, expiration);
            }

            this._log('parsed network response', parsedResponseData);
            return parsedResponseData;
        } catch (err) {
            throw new Error(err);
        }
    }

    public async fetchHeaders (service: string, options?: IFetchOptions): Promise<any> {
        try {
            return await this.fetch(service, { ...options, fetchHeaders: true });
        } catch (err) {
            throw new Error(err);
        }
    }

    public async clearCache (service?: string): Promise<void> {
        this._log(`clearing ${service ? `cache for ${service}` : 'all cache'}...`);
        try {
            // Push every key that need to be removed in this array
            let keysToRemove = [];
            if (!service) {
                // Clear everything
                for (let serviceName in this._APIServices) {
                    let keysForService = await this._getAllKeysForService(serviceName);
                    keysToRemove = [...keysToRemove, ...keysForService];
                }
            } else {
                // Clear only the supplied service's dictionary and associated keys
                if (!this._APIServices[service]) {
                    throw new Error(`Cannot clear cache for unregistered service : '${service}'`);
                }
                keysToRemove = await this._getAllKeysForService(service);
            }
            this._log('keys to be removed', keysToRemove);
            await Promise.all(keysToRemove.map((key: string) => this._APICacheDriver.removeItem(key)));
            return;
        } catch (err) {
            throw new Error(err);
        }
    }

    public setOptions (options: IAPIOptions): void {
        this._APIOptions = this._mergeAPIOptionsWithDefaultValues(options);
        this._log('options set to ', this._APIOptions);

        if (!this._APIOptions.domains.default) {
            throw new Error(
                "You didn't set your default domain URL in your options. \n " +
                "new APIpeline({ domains: { default: 'http://myApi.net' } }, ...)"
            );
        }
    }

    public setServices (services: IAPIServices): void {
        this._APIServices = this._mergeServicesWithDefaultValues(services);
        this._log('services set to', this._APIServices);
    }

    public setCacheDriver (driver: IAPICacheDriver): void {
        this._APICacheDriver = driver;
        this._log('custom driver set');
    }

    private _createHTTPMethods () {
        HTTP_METHODS.forEach((method: IHTTPMethods) => {
            this[method.toLocaleLowerCase()] = async (...args: any[]) => this.fetch(args[0], args[1], method);
        });
    }

    /**
     * Simple helper that won't ever throw an error into the stack if the network request
     * isn't successful. This is useful to implement the cache's logic when the API is unreachable.
     * @private
     * @param {string} url
     * @param {*} [options]
     * @returns {Promise<IFetchResponse>}
     * @memberof APIpeline
     */
    private async _fetch (url: string, options?: any): Promise<IFetchResponse> {
        try {
            return { success: true, data: await this._APIOptions.fetchMethod(url, options) };
        } catch (err) {
            console.warn(err);
            return { success: false };
        }
    }

    /**
     * Cache the network response for a request. Create the service dictionary if it hasn't been done yet,
     * store the expiration date to the requestId and finally store the data itself.
     * @private
     * @param {string} service
     * @param {string} requestId
     * @param {*} response
     * @param {number} expiration
     * @returns {(Promise<void|boolean>)}
     * @memberof APIpeline
     */
    private async _cache (
        serviceDefinition: IAPIService,
        service: string,
        requestId: string,
        response: any,
        expiration: number
    ): Promise<void|boolean> {
        const shouldCap =
            typeof serviceDefinition.capService !== 'undefined' ?
            serviceDefinition.capService :
            this._APIOptions.capServices;

        try {
            this._log(`Caching ${requestId} ...`);
            await this._addKeyToServiceDictionary(service, requestId, expiration);
            await this._APICacheDriver.setItem(this._getCacheObjectKey(requestId), JSON.stringify(response));
            this._log(`Updated cache for request ${requestId}`);

            // If capping is enabled for this request, get the service's dictionary cached items.
            // If cap is reached, get the oldest cached item and remove it.
            if (shouldCap) {
                const capLimit = serviceDefinition.capLimit || this._APIOptions.capLimit;
                const serviceDictionaryKey = this._getServiceDictionaryKey(service);
                let dictionary = await this._APICacheDriver.getItem(serviceDictionaryKey);
                if (dictionary) {
                    dictionary = JSON.parse(dictionary);
                    const cachedItemsCount = Object.keys(dictionary).length;
                    if (cachedItemsCount > capLimit) {
                        this._log(
                            `service ${service} cap reached (${cachedItemsCount} / ${capLimit})` +
                            ', removing the oldest cached item...'
                        );
                        const { key } = this._getOldestCachedItem(dictionary);
                        delete dictionary[key];
                        await this._APICacheDriver.removeItem(this._getCacheObjectKey(key));
                        this._APICacheDriver.setItem(serviceDictionaryKey, JSON.stringify(dictionary));
                    }
                }
            }

            return true;
        } catch (err) {
            throw new Error(`Error while caching API response for ${requestId}`);
        }
    }

    /**
     * Promise that tries to fetch a cached data. Resolves the data if successful and its freshness.
     * If this request hasn't been cached yet, resolves with success set to false.
     * Throws an error only if the data itself couldn't be fetched for any reason.
     * @private
     * @param {string} service
     * @param {string} requestId
     * @param {string} fullPath
     * @returns {Promise<ICachedData>}
     * @memberof APIpeline
     */
    private async _getCachedData (service: string, requestId: string, fullPath: string, shouldUseCache: boolean): Promise<ICachedData> {
        if (!this._APICacheDriver || !shouldUseCache) {
            return { success: false };
        }
        let serviceDictionary = await this._APICacheDriver.getItem(this._getServiceDictionaryKey(service));
        serviceDictionary = JSON.parse(serviceDictionary) || {};

        const expiration = serviceDictionary[requestId];
        if (expiration) {
            this._log(`${fullPath} already cached, expiring at : ${expiration}`);
            try {
                const rawCachedData = await this._APICacheDriver.getItem(this._getCacheObjectKey(requestId));
                const parsedCachedData = JSON.parse(rawCachedData);
                if (expiration > Date.now()) {
                    return { success: true, fresh: true, data: parsedCachedData };
                } else {
                    return { success: true, fresh: false, data: parsedCachedData };
                }
            } catch (err) {
                throw new Error(err);
            }
        } else {
            this._log(`${fullPath} not yet cached`);
            return { success: false };
        }
    }


    /**
     * Helper returning if caching should be enabled for a request.
     * Cache enabling priority :
     * option parameter of fetch() > service definition > default setting
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {IFetchOptions} options
     * @returns {boolean}
     * @memberof APIpeline
     */
    private _shouldUseCache (serviceDefinition: IAPIService, options: IFetchOptions): boolean {
        if (!this._APICacheDriver) {
            return false;
        } else if (options && typeof options.disableCache !== 'undefined') {
            return !options.disableCache;
        } else if (serviceDefinition && typeof serviceDefinition.disableCache !== 'undefined') {
            return !serviceDefinition.disableCache;
        } else {
            return !this._APIOptions.disableCache;
        }
    }

    /**
     * Pushes a requestId into a service's dictionary and associate its expiration date to it.
     * @private
     * @param {string} service
     * @param {string} requestId
     * @param {number} expiration
     * @returns {Promise<boolean>}
     * @memberof APIpeline
     */
    private async _addKeyToServiceDictionary (service: string, requestId: string, expiration: number): Promise<boolean> {
        try {
            const serviceDictionaryKey = this._getServiceDictionaryKey(service);
            let dictionary = await this._APICacheDriver.getItem(serviceDictionaryKey);
            if (!dictionary) {
                dictionary = {};
            } else {
                dictionary = JSON.parse(dictionary);
            }
            dictionary[requestId] = expiration;
            this._APICacheDriver.setItem(serviceDictionaryKey, JSON.stringify(dictionary));
            return true;
        } catch (err) {
            throw new Error(err);
        }
    }


    /**
     * Returns the key and the expiration date of the oldest cached item of a cache dictionary
     * @private
     * @param {ICacheDictionary} dictionary
     * @returns {*}
     * @memberof APIpeline
     */
    private _getOldestCachedItem (dictionary: ICacheDictionary): any {
        let oldest;
        for (let key in dictionary) {
            const keyExpiration: number = dictionary[key];
            if (oldest) {
                if (keyExpiration < oldest.expiration) {
                    oldest = { key, expiration: keyExpiration };
                }
            } else {
                oldest = { key, expiration: keyExpiration };
            }
        }
        return oldest;
    }

    /**
     * Promise that resolves every cache key associated to a service : the service dictionary's name, and all requestId
     * stored. This is useful to clear the cache without affecting the user's stored data not related to this API.
     * @private
     * @param {string} service
     * @returns {Promise<string[]>}
     * @memberof APIpeline
     */
    private async _getAllKeysForService (service: string): Promise<string[]> {
        try {
            let keys = [];
            const serviceDictionaryKey = this._getServiceDictionaryKey(service);
            keys.push(serviceDictionaryKey);
            let dictionary = await this._APICacheDriver.getItem(serviceDictionaryKey);
            if (dictionary) {
                dictionary = JSON.parse(dictionary);
                const dictionaryKeys = Object.keys(dictionary).map((key: string) => `${this._APIOptions.cachePrefix}:${key}`);
                keys = [...keys, ...dictionaryKeys];
            }
            return keys;
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Simple helper getting a service's dictionary cache key.
     * @private
     * @param {string} service
     * @returns {string}
     * @memberof APIPeline
     */
    private _getServiceDictionaryKey (service: string): string {
        return `${this._APIOptions.cachePrefix}:dictionary:${service}`;
    }

    /**
     * Simple helper getting a request's cache key.
     * @private
     * @param {string} requestId
     * @returns {string}
     * @memberof APIPeline
     */
    private _getCacheObjectKey (requestId: string): string {
        return `${this._APIOptions.cachePrefix}:${requestId}`;
    }

    /**
     * Resolve each middleware provided and merge them into a single object that will be passed to
     * the network request.
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {IFetchOptions} [options]
     * @returns {Promise<any>}
     * @memberof APIpeline
     */
    private async _applyMiddlewares (
        serviceDefinition: IAPIService,
        paths: IMiddlewarePaths,
        options?: IFetchOptions
    ): Promise<any> {
        // Middleware priority : options parameter of fetch() > service definition middleware > global middleware.
        let middlewares = (options && options.middlewares) || serviceDefinition.middlewares || this._APIOptions.middlewares;
        if (middlewares && middlewares.length) {
            try {
                middlewares = middlewares.map((middleware: APIMiddleware) => middleware(serviceDefinition, paths, options));
                const resolvedMiddlewares = await Promise.all(middlewares);
                return _merge(...resolvedMiddlewares);
            } catch (err) {
                throw new Error(`Error while applying middlewares for ${serviceDefinition.path} : ${err}`);
            }
        } else {
            return {};
        }
    }

    private _buildRequestId (
        serviceDefinition: IAPIService,
        fullPath: string,
        fetchHeaders: boolean,
        mergedOptions?: IFetchOptions, // fully merged options
        fetchOptions?: IFetchOptions // fetch options
    ): string {
        const ignoreHeadersWhenCaching =
            this._APIOptions.ignoreHeadersWhenCaching ||
            serviceDefinition.ignoreHeadersWhenCaching ||
            (fetchOptions && fetchOptions.ignoreHeadersWhenCaching);

        const _sha = new sha('SHA-1', 'TEXT');
        let requestStringId = `${fullPath}:${fetchHeaders ? 'headersOnly' : ''}`;

        Object.keys(mergedOptions).forEach((key: string) => {
            if (!ignoreHeadersWhenCaching || key !== 'headers') {
                requestStringId += JSON.stringify(mergedOptions[key]);
            }
        });
        _sha.update(requestStringId);
        return _sha.getHash('HEX');
    }

    /**
     * Helper returning the full URL of a service and its options.
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {IFetchOptions} [options]
     * @returns {string}
     * @memberof APIpeline
     */
    private _constructPath (serviceDefinition: IAPIService, options?: IFetchOptions): IMiddlewarePaths {
        const domainKey = (options && options.domain) || serviceDefinition.domain;
        const domainURL = this._APIOptions.domains[domainKey];
        const prefixKey = (options && options.prefix) || serviceDefinition.prefix;
        const prefix = this._APIOptions.prefixes[prefixKey];
        const { fullyParsed, withoutQueryParams } = this._parsePath(serviceDefinition, options);
        const urlRoot = domainURL + prefix + '/';

        return {
            fullPath: urlRoot + fullyParsed,
            withoutQueryParams: urlRoot + withoutQueryParams
        };
    }

    /**
     * Helper replacing the pathParameters from the service definition's path and appending
     * any supplied query parameters. For instance :
     * pathParameters: { articleId: 'xSfdk21' }, queryParameters : { refresh: true, orderBy: 'date' }
     * http://myapi.tld/article/:articleId => http://myapi.tld/article/xSfdk21?refresh=true&orderBy=date
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {IFetchOptions} [options]
     * @returns {string}
     * @memberof APIpeline
     */
    private _parsePath (serviceDefinition: IAPIService, options?: IFetchOptions): any {
        const { encodeParameters } = this._APIOptions;
        let path = serviceDefinition.path;
        let parsedQueryParameters = '';

        if (options && options.pathParameters) {
            const { pathParameters } = options;
            for (let i in pathParameters) {
                if (typeof pathParameters[i] === 'undefined') {
                    continue;
                }
                if (encodeParameters) {
                    pathParameters[i] = encodeURIComponent(pathParameters[i]);
                }
                path = path.replace(`:${i}`, pathParameters[i]);
            }
        }
        if (options && options.queryParameters) {
            const { queryParameters } = options;
            let insertedQueryParameters = 0;
            for (let i in queryParameters) {
                if (typeof queryParameters[i] === 'undefined') {
                    continue;
                }
                if (encodeParameters) {
                    queryParameters[i] = encodeURIComponent(queryParameters[i]);
                }
                parsedQueryParameters += insertedQueryParameters === 0 ?
                    `?${i}=${queryParameters[i]}` :
                    `&${i}=${queryParameters[i]}`;
                insertedQueryParameters++;
            }
        }
        return {
            fullyParsed: path + parsedQueryParameters,
            withoutQueryParams: path
        };
    }

    /**
     * Merge the supplied API options with the default ones.
     * @private
     * @param {IAPIOptions} options
     * @returns {IAPIOptions}
     * @memberof APIpeline
     */
    private _mergeAPIOptionsWithDefaultValues (options: IAPIOptions): IAPIOptions {
        return {
            ...DEFAULT_API_OPTIONS,
            ...options,
            prefixes: {
                ...DEFAULT_API_OPTIONS.prefixes,
                ...(options.prefixes || {})
            }
        };
    }

    /**
     * For each suppliedservice, map the default service options to it and throw errors if the required
     * options are missing.
     * @private
     * @param {IAPIServices} services
     * @returns {IAPIServices}
     * @memberof APIpeline
     */
    private _mergeServicesWithDefaultValues (services: IAPIServices): IAPIServices {
        return _mapValues(services, (service: IAPIService, serviceName: string) => {
            if (service.domain && typeof this._APIOptions.domains[service.domain] === 'undefined') {
                throw new Error(
                    `Domain key ${service.domain} specified for service ${serviceName} hasn't been declared. \n` +
                    'Please provide it in your APIpeline parameters or leave it blank to use the default one.'
                );
            }
            if (service.prefix && typeof this._APIOptions.prefixes[service.prefix] === 'undefined') {
                throw new Error(
                    `Prefix key ${service.domain} specified for service ${serviceName} hasn't been declared. \n` +
                    'Please provide it in your APIpeline parameters or leave it blank to use the default one.'
                );
            }
            return {
                ...DEFAULT_SERVICE_OPTIONS,
                ...service
            };
        });
    }

    /**
     * Debug helper logging every network request.
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {boolean} fetchHeaders
     * @param {IFetchOptions} [options]
     * @memberof APIpeline
     */
    private _logNetwork (
        serviceDefinition: IAPIService,
        fullPath: string,
        fetchHeaders: boolean,
        options?: IFetchOptions,
        forcedHTTPMethod?: IHTTPMethods
    ): void {
        if (this._APIOptions.printNetworkRequests) {
            console.log(
                `%c Network request ${fetchHeaders ? '(headers only)' : ''} for ${fullPath} ` +
                `(${forcedHTTPMethod || (options && options.method) || serviceDefinition.method})`,
                'font-weight: bold; color: blue'
            );
        }
    }

    /**
     * Debug helper logging every major logic step when user has enabled debugging.
     * @private
     * @param {string} msg
     * @param {*} [value]
     * @memberof APIpeline
     */
    private _log (msg: string, value?: any): void {
        if (this._APIOptions.debugAPI) {
            if (value) {
                console.log(`APIpeline | ${msg}`, value);
            } else {
                console.log(`APIpeline | ${msg}`);
            }
        }
    }
}
