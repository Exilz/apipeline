"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var sqlite_1 = require("./drivers/sqlite");
var _mapValues = require("lodash.mapvalues");
var _merge = require("lodash.merge");
var sha = require("jssha");
var DEFAULT_API_OPTIONS = {
    debugAPI: false,
    prefixes: { default: '/' },
    printNetworkRequests: false,
    disableCache: false,
    cacheExpiration: 5 * 60 * 1000,
    cachePrefix: 'offlineApiCache',
    ignoreHeadersWhenCaching: false,
    capServices: false,
    capLimit: 50
};
var DEFAULT_SERVICE_OPTIONS = {
    method: 'GET',
    domain: 'default',
    prefix: 'default'
};
var DEFAULT_CACHE_DRIVER = react_native_1.AsyncStorage;
var HTTP_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'];
exports.drivers = { sqliteDriver: sqlite_1.default };
var OfflineFirstAPI = (function () {
    function OfflineFirstAPI(options, services, driver) {
        this._APIServices = {};
        this._APIDriver = DEFAULT_CACHE_DRIVER;
        options && this.setOptions(options);
        services && this.setServices(services);
        driver && this.setCacheDriver(driver);
        this._createHTTPMethods();
    }
    OfflineFirstAPI.prototype._createHTTPMethods = function () {
        var _this = this;
        HTTP_METHODS.forEach(function (method) {
            _this[method.toLocaleLowerCase()] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, this.fetch(args[0], args[1], method)];
                }); });
            };
        });
    };
    OfflineFirstAPI.prototype.fetch = function (service, options, forcedHTTPMethod) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceDefinition, _a, fullPath, withoutQueryParams, middlewares, fetchOptions, fetchHeaders, shouldUseCache, expiration, requestId, expirationDelay, cachedData, parsedResponseData, res, _b, responseMiddleware, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        serviceDefinition = this._APIServices[service];
                        if (!serviceDefinition) {
                            throw new Error("Cannot fetch data from unregistered service '" + service + "'");
                        }
                        _a = this._constructPath(serviceDefinition, options), fullPath = _a.fullPath, withoutQueryParams = _a.withoutQueryParams;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 11, , 12]);
                        return [4 /*yield*/, this._applyMiddlewares(serviceDefinition, { fullPath: fullPath, withoutQueryParams: withoutQueryParams }, options)];
                    case 2:
                        middlewares = _c.sent();
                        fetchOptions = _merge(middlewares, (options && options.fetchOptions) || {}, { method: forcedHTTPMethod || serviceDefinition.method }, { headers: (options && options.headers) || {} });
                        fetchHeaders = options && options.fetchHeaders;
                        shouldUseCache = this._shouldUseCache(serviceDefinition, options);
                        expiration = void 0;
                        requestId = this._buildRequestId(serviceDefinition, fullPath, fetchHeaders, fetchOptions, options);
                        expirationDelay = (options && options.expiration) || serviceDefinition.expiration || this._APIOptions.cacheExpiration;
                        expiration = Date.now() + expirationDelay;
                        return [4 /*yield*/, this._getCachedData(service, requestId, fullPath)];
                    case 3:
                        cachedData = _c.sent();
                        if (cachedData.success && cachedData.fresh && shouldUseCache) {
                            this._log("Using fresh cache for " + fullPath);
                            return [2 /*return*/, cachedData.data];
                        }
                        // Network fetch
                        this._logNetwork(serviceDefinition, fullPath, fetchHeaders, options, forcedHTTPMethod);
                        this._log('full URL for request', fullPath);
                        this._log('full fetch options for request', fetchOptions);
                        parsedResponseData = void 0;
                        return [4 /*yield*/, this._fetch(fullPath, fetchOptions)];
                    case 4:
                        res = _c.sent();
                        // If the network request fails, return the cached data if it's valid, a throw an error
                        if (!res.success) {
                            if (cachedData.success && cachedData.data) {
                                this._log("Using stale cache for " + fullPath + " (network request failed)");
                                return [2 /*return*/, cachedData.data];
                            }
                            else {
                                throw new Error("Cannot fetch data for " + service + " online, no cache either.");
                            }
                        }
                        this._log('raw network response', res);
                        if (!fetchHeaders) return [3 /*break*/, 5];
                        parsedResponseData = res.data.headers && res.data.headers.map ? res.data.headers.map : {};
                        return [3 /*break*/, 10];
                    case 5:
                        if (!((options && options.rawData) || serviceDefinition.rawData)) return [3 /*break*/, 6];
                        _b = res.data;
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, res.data.json()];
                    case 7:
                        _b = _c.sent();
                        _c.label = 8;
                    case 8:
                        parsedResponseData = _b;
                        responseMiddleware = (options && options.responseMiddleware) ||
                            serviceDefinition.responseMiddleware ||
                            this._APIOptions.responseMiddleware;
                        if (!responseMiddleware) return [3 /*break*/, 10];
                        return [4 /*yield*/, responseMiddleware(parsedResponseData)];
                    case 9:
                        parsedResponseData = _c.sent();
                        _c.label = 10;
                    case 10:
                        // Cache if it hasn't been disabled and if the network request has been successful
                        if (res.data.ok && shouldUseCache) {
                            this._cache(serviceDefinition, service, requestId, parsedResponseData, expiration);
                        }
                        this._log('parsed network response', parsedResponseData);
                        return [2 /*return*/, parsedResponseData];
                    case 11:
                        err_1 = _c.sent();
                        throw new Error(err_1);
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    OfflineFirstAPI.prototype.fetchHeaders = function (service, options) {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.fetch(service, __assign({}, options, { fetchHeaders: true }))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_2 = _a.sent();
                        throw new Error(err_2);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OfflineFirstAPI.prototype.clearCache = function (service) {
        return __awaiter(this, void 0, void 0, function () {
            var keysToRemove, _a, _b, _i, serviceName, keysForService, err_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this._log("clearing " + (service ? "cache for " + service : 'all cache') + "...");
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 10, , 11]);
                        keysToRemove = [];
                        if (!!service) return [3 /*break*/, 6];
                        _a = [];
                        for (_b in this._APIServices)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        serviceName = _a[_i];
                        return [4 /*yield*/, this._getAllKeysForService(serviceName)];
                    case 3:
                        keysForService = _c.sent();
                        keysToRemove = keysToRemove.concat(keysForService);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        // Clear only the supplied service's dictionary and associated keys
                        if (!this._APIServices[service]) {
                            throw new Error("Cannot clear cache for unregistered service : '" + service + "'");
                        }
                        return [4 /*yield*/, this._getAllKeysForService(service)];
                    case 7:
                        keysToRemove = _c.sent();
                        _c.label = 8;
                    case 8:
                        this._log('keys to be removed', keysToRemove);
                        return [4 /*yield*/, this._APIDriver.multiRemove(keysToRemove)];
                    case 9:
                        _c.sent();
                        return [2 /*return*/];
                    case 10:
                        err_3 = _c.sent();
                        throw new Error(err_3);
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    OfflineFirstAPI.prototype.setOptions = function (options) {
        this._APIOptions = this._mergeAPIOptionsWithDefaultValues(options);
        this._log('options set to ', this._APIOptions);
        if (!this._APIOptions.domains.default) {
            throw new Error("You didn't set your default domain URL in your options. \n " +
                "new OfflineFirstAPI({ domains: { default: 'http://myApi.net' } }, ...)");
        }
    };
    OfflineFirstAPI.prototype.setServices = function (services) {
        this._APIServices = this._mergeServicesWithDefaultValues(services);
        this._log('services set to', this._APIServices);
    };
    OfflineFirstAPI.prototype.setCacheDriver = function (driver) {
        this._APIDriver = driver;
        this._log('custom driver set');
    };
    /**
     * Simple helper that won't ever throw an error into the stack if the network request
     * isn't successful. This is useful to implement the cache's logic when the API is unreachable.
     * @private
     * @param {string} url
     * @param {*} [options]
     * @returns {Promise<IFetchResponse>}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._fetch = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, err_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = { success: true };
                        return [4 /*yield*/, fetch(url, options)];
                    case 1: return [2 /*return*/, (_a.data = _b.sent(), _a)];
                    case 2:
                        err_4 = _b.sent();
                        return [2 /*return*/, { success: false }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cache the network response for a request. Create the service dictionary if it hasn't been done yet,
     * store the expiration date to the requestId and finally store the data itself.
     * @private
     * @param {string} service
     * @param {string} requestId
     * @param {*} response
     * @param {number} expiration
     * @returns {(Promise<void|boolean>)}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._cache = function (serviceDefinition, service, requestId, response, expiration) {
        return __awaiter(this, void 0, void 0, function () {
            var shouldCap, capLimit, serviceDictionaryKey, dictionary, cachedItemsCount, key, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shouldCap = typeof serviceDefinition.capService !== 'undefined' ?
                            serviceDefinition.capService :
                            this._APIOptions.capServices;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        this._log("Caching " + requestId + " ...");
                        return [4 /*yield*/, this._addKeyToServiceDictionary(service, requestId, expiration)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._APIDriver.setItem(this._getCacheObjectKey(requestId), JSON.stringify(response))];
                    case 3:
                        _a.sent();
                        this._log("Updated cache for request " + requestId);
                        if (!shouldCap) return [3 /*break*/, 6];
                        capLimit = serviceDefinition.capLimit || this._APIOptions.capLimit;
                        serviceDictionaryKey = this._getServiceDictionaryKey(service);
                        return [4 /*yield*/, this._APIDriver.getItem(serviceDictionaryKey)];
                    case 4:
                        dictionary = _a.sent();
                        if (!dictionary) return [3 /*break*/, 6];
                        dictionary = JSON.parse(dictionary);
                        cachedItemsCount = Object.keys(dictionary).length;
                        if (!(cachedItemsCount > capLimit)) return [3 /*break*/, 6];
                        this._log("service " + service + " cap reached (" + cachedItemsCount + " / " + capLimit + ")" +
                            ', removing the oldest cached item...');
                        key = this._getOldestCachedItem(dictionary).key;
                        delete dictionary[key];
                        return [4 /*yield*/, this._APIDriver.removeItem(this._getCacheObjectKey(key))];
                    case 5:
                        _a.sent();
                        this._APIDriver.setItem(serviceDictionaryKey, JSON.stringify(dictionary));
                        _a.label = 6;
                    case 6: return [2 /*return*/, true];
                    case 7:
                        err_5 = _a.sent();
                        throw new Error("Error while caching API response for " + requestId);
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Promise that tries to fetch a cached data. Resolves the data if successful and its freshness.
     * If this request hasn't been cached yet, resolves with success set to false.
     * Throws an error only if the data itself couldn't be fetched for any reason.
     * @private
     * @param {string} service
     * @param {string} requestId
     * @param {string} fullPath
     * @returns {Promise<ICachedData>}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._getCachedData = function (service, requestId, fullPath) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceDictionary, expiration, rawCachedData, parsedCachedData, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._APIDriver.getItem(this._getServiceDictionaryKey(service))];
                    case 1:
                        serviceDictionary = _a.sent();
                        serviceDictionary = JSON.parse(serviceDictionary) || {};
                        expiration = serviceDictionary[requestId];
                        if (!expiration) return [3 /*break*/, 6];
                        this._log(fullPath + " already cached, expiring at : " + expiration);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._APIDriver.getItem(this._getCacheObjectKey(requestId))];
                    case 3:
                        rawCachedData = _a.sent();
                        parsedCachedData = JSON.parse(rawCachedData);
                        if (expiration > Date.now()) {
                            return [2 /*return*/, { success: true, fresh: true, data: parsedCachedData }];
                        }
                        else {
                            return [2 /*return*/, { success: true, fresh: false, data: parsedCachedData }];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_6 = _a.sent();
                        throw new Error(err_6);
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        this._log(fullPath + " not yet cached");
                        return [2 /*return*/, { success: false }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Helper returning if caching should be enabled for a request.
     * Cache enabling priority :
     * option parameter of fetch() > service definition > default setting
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {IFetchOptions} options
     * @returns {boolean}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._shouldUseCache = function (serviceDefinition, options) {
        if (options && typeof options.disableCache !== 'undefined') {
            return !options.disableCache;
        }
        else if (serviceDefinition && typeof serviceDefinition.disableCache !== 'undefined') {
            return !serviceDefinition.disableCache;
        }
        else {
            return !this._APIOptions.disableCache;
        }
    };
    /**
     * Pushes a requestId into a service's dictionary and associate its expiration date to it.
     * @private
     * @param {string} service
     * @param {string} requestId
     * @param {number} expiration
     * @returns {Promise<boolean>}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._addKeyToServiceDictionary = function (service, requestId, expiration) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceDictionaryKey, dictionary, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        serviceDictionaryKey = this._getServiceDictionaryKey(service);
                        return [4 /*yield*/, this._APIDriver.getItem(serviceDictionaryKey)];
                    case 1:
                        dictionary = _a.sent();
                        if (!dictionary) {
                            dictionary = {};
                        }
                        else {
                            dictionary = JSON.parse(dictionary);
                        }
                        dictionary[requestId] = expiration;
                        this._APIDriver.setItem(serviceDictionaryKey, JSON.stringify(dictionary));
                        return [2 /*return*/, true];
                    case 2:
                        err_7 = _a.sent();
                        throw new Error(err_7);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the key and the expiration date of the oldest cached item of a cache dictionary
     * @private
     * @param {ICacheDictionary} dictionary
     * @returns {*}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._getOldestCachedItem = function (dictionary) {
        var oldest;
        for (var key in dictionary) {
            var keyExpiration = dictionary[key];
            if (oldest) {
                if (keyExpiration < oldest.expiration) {
                    oldest = { key: key, expiration: keyExpiration };
                }
            }
            else {
                oldest = { key: key, expiration: keyExpiration };
            }
        }
        return oldest;
    };
    /**
     * Promise that resolves every cache key associated to a service : the service dictionary's name, and all requestId
     * stored. This is useful to clear the cache without affecting the user's stored data not related to this API.
     * @private
     * @param {string} service
     * @returns {Promise<string[]>}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._getAllKeysForService = function (service) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var keys, serviceDictionaryKey, dictionary, dictionaryKeys, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        keys = [];
                        serviceDictionaryKey = this._getServiceDictionaryKey(service);
                        keys.push(serviceDictionaryKey);
                        return [4 /*yield*/, this._APIDriver.getItem(serviceDictionaryKey)];
                    case 1:
                        dictionary = _a.sent();
                        if (dictionary) {
                            dictionary = JSON.parse(dictionary);
                            dictionaryKeys = Object.keys(dictionary).map(function (key) { return _this._APIOptions.cachePrefix + ":" + key; });
                            keys = keys.concat(dictionaryKeys);
                        }
                        return [2 /*return*/, keys];
                    case 2:
                        err_8 = _a.sent();
                        throw new Error(err_8);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Simple helper getting a service's dictionary cache key.
     * @private
     * @param {string} service
     * @returns {string}
     * @memberof OfflineFirstAP
     */
    OfflineFirstAPI.prototype._getServiceDictionaryKey = function (service) {
        return this._APIOptions.cachePrefix + ":dictionary:" + service;
    };
    /**
     * Simple helper getting a request's cache key.
     * @private
     * @param {string} requestId
     * @returns {string}
     * @memberof OfflineFirstAP
     */
    OfflineFirstAPI.prototype._getCacheObjectKey = function (requestId) {
        return this._APIOptions.cachePrefix + ":" + requestId;
    };
    /**
     * Resolve each middleware provided and merge them into a single object that will be passed to
     * the network request.
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {IFetchOptions} [options]
     * @returns {Promise<any>}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._applyMiddlewares = function (serviceDefinition, paths, options) {
        return __awaiter(this, void 0, void 0, function () {
            var middlewares, resolvedMiddlewares, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        middlewares = (options && options.middlewares) || serviceDefinition.middlewares || this._APIOptions.middlewares;
                        if (!(middlewares && middlewares.length)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        middlewares = middlewares.map(function (middleware) { return middleware(serviceDefinition, paths, options); });
                        return [4 /*yield*/, Promise.all(middlewares)];
                    case 2:
                        resolvedMiddlewares = _a.sent();
                        return [2 /*return*/, _merge.apply(void 0, resolvedMiddlewares)];
                    case 3:
                        err_9 = _a.sent();
                        throw new Error("Error while applying middlewares for " + serviceDefinition.path + " : " + err_9);
                    case 4: return [3 /*break*/, 6];
                    case 5: return [2 /*return*/, {}];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    OfflineFirstAPI.prototype._buildRequestId = function (serviceDefinition, fullPath, fetchHeaders, mergedOptions, // fully merged options
        fetchOptions // fetch options
    ) {
        var ignoreHeadersWhenCaching = this._APIOptions.ignoreHeadersWhenCaching ||
            serviceDefinition.ignoreHeadersWhenCaching ||
            (fetchOptions && fetchOptions.ignoreHeadersWhenCaching);
        var _sha = new sha('SHA-1', 'TEXT');
        var requestStringId = fullPath + ":" + (fetchHeaders ? 'headersOnly' : '');
        Object.keys(mergedOptions).forEach(function (key) {
            if (!ignoreHeadersWhenCaching || key !== 'headers') {
                requestStringId += JSON.stringify(mergedOptions[key]);
            }
        });
        _sha.update(requestStringId);
        return _sha.getHash('HEX');
    };
    /**
     * Helper returning the full URL of a service and its options.
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {IFetchOptions} [options]
     * @returns {string}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._constructPath = function (serviceDefinition, options) {
        var domainKey = (options && options.domain) || serviceDefinition.domain;
        var domainURL = this._APIOptions.domains[domainKey];
        var prefixKey = (options && options.prefix) || serviceDefinition.prefix;
        var prefix = this._APIOptions.prefixes[prefixKey];
        var _a = this._parsePath(serviceDefinition, options), fullyParsed = _a.fullyParsed, withoutQueryParams = _a.withoutQueryParams;
        var urlRoot = domainURL + prefix + '/';
        return {
            fullPath: urlRoot + fullyParsed,
            withoutQueryParams: urlRoot + withoutQueryParams
        };
    };
    /**
     * Helper replacing the pathParameters from the service definition's path and appending
     * any supplied query parameters. For instance :
     * pathParameters: { articleId: 'xSfdk21' }, queryParameters : { refresh: true, orderBy: 'date' }
     * http://myapi.tld/article/:articleId => http://myapi.tld/article/xSfdk21?refresh=true&orderBy=date
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {IFetchOptions} [options]
     * @returns {string}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._parsePath = function (serviceDefinition, options) {
        var path = serviceDefinition.path;
        var parsedQueryParameters = '';
        if (options && options.pathParameters) {
            var pathParameters = options.pathParameters;
            for (var i in pathParameters) {
                if (typeof pathParameters[i] === 'undefined') {
                    continue;
                }
                path = path.replace(":" + i, pathParameters[i]);
            }
        }
        if (options && options.queryParameters) {
            var queryParameters = options.queryParameters;
            var insertedQueryParameters = 0;
            for (var i in queryParameters) {
                if (typeof queryParameters[i] === 'undefined') {
                    continue;
                }
                parsedQueryParameters += insertedQueryParameters === 0 ?
                    "?" + i + "=" + queryParameters[i] :
                    "&" + i + "=" + queryParameters[i];
                insertedQueryParameters++;
            }
        }
        return {
            fullyParsed: path + parsedQueryParameters,
            withoutQueryParams: path
        };
    };
    /**
     * Merge the supplied API options with the default ones.
     * @private
     * @param {IAPIOptions} options
     * @returns {IAPIOptions}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._mergeAPIOptionsWithDefaultValues = function (options) {
        return __assign({}, DEFAULT_API_OPTIONS, options, { prefixes: __assign({}, DEFAULT_API_OPTIONS.prefixes, (options.prefixes || {})) });
    };
    /**
     * For each suppliedservice, map the default service options to it and throw errors if the required
     * options are missing.
     * @private
     * @param {IAPIServices} services
     * @returns {IAPIServices}
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._mergeServicesWithDefaultValues = function (services) {
        var _this = this;
        return _mapValues(services, function (service, serviceName) {
            if (service.domain && typeof _this._APIOptions.domains[service.domain] === 'undefined') {
                throw new Error("Domain key " + service.domain + " specified for service " + serviceName + " hasn't been declared. \n" +
                    'Please provide it in your OfflineFirstAPI parameters or leave it blank to use the default one.');
            }
            if (service.prefix && typeof _this._APIOptions.prefixes[service.prefix] === 'undefined') {
                throw new Error("Prefix key " + service.domain + " specified for service " + serviceName + " hasn't been declared. \n" +
                    'Please provide it in your OfflineFirstAPI parameters or leave it blank to use the default one.');
            }
            return __assign({}, DEFAULT_SERVICE_OPTIONS, service);
        });
    };
    /**
     * Debug helper logging every network request.
     * @private
     * @param {IAPIService} serviceDefinition
     * @param {boolean} fetchHeaders
     * @param {IFetchOptions} [options]
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._logNetwork = function (serviceDefinition, fullPath, fetchHeaders, options, forcedHTTPMethod) {
        if (this._APIOptions.printNetworkRequests) {
            console.log("%c Network request " + (fetchHeaders ? '(headers only)' : '') + " for " + fullPath + " " +
                ("(" + (forcedHTTPMethod || (options && options.method) || serviceDefinition.method) + ")"), 'font-weight: bold; color: blue');
        }
    };
    /**
     * Debug helper logging every major logic step when user has enabled debugging.
     * @private
     * @param {string} msg
     * @param {*} [value]
     * @memberof OfflineFirstAPI
     */
    OfflineFirstAPI.prototype._log = function (msg, value) {
        if (this._APIOptions.debugAPI) {
            if (value) {
                console.log("OfflineFirstAPI | " + msg, value);
            }
            else {
                console.log("OfflineFirstAPI | " + msg);
            }
        }
    };
    return OfflineFirstAPI;
}());
exports.default = OfflineFirstAPI;
