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
var _mapValues = require("lodash.mapvalues");
var _merge = require("lodash.merge");
var sha = require("jssha");
var DEFAULT_API_OPTIONS = {
    debugAPI: false,
    prefixes: { default: '/' },
    printNetworkRequests: false,
    disableCache: false,
    cacheExpiration: 5 * 60 * 1000
};
var DEFAULT_SERVICE_OPTIONS = {
    method: 'GET',
    domain: 'default',
    prefix: 'default',
    disableCache: false
};
var DEFAULT_CACHE_DRIVER = react_native_1.AsyncStorage;
var CACHE_PREFIX = 'offlineApiCache:';
// AsyncStorage.clear();
var OfflineFirstAPI = (function () {
    function OfflineFirstAPI(options, services, driver) {
        this._APIServices = {};
        this._APIDriver = DEFAULT_CACHE_DRIVER;
        options && this.setOptions(options);
        services && this.setServices(services);
        driver && this.setCacheDriver(driver);
    }
    OfflineFirstAPI.prototype.fetch = function (service, options) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceDefinition, fullPath, middlewares, fetchOptions, fetchHeaders, shouldCache, requestId, expiration, _sha, expirationDelay, cachedData, parsedRes, res, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serviceDefinition = this._APIServices[service];
                        if (!serviceDefinition) {
                            throw new Error("Cannot fetch data from unregistered service '" + service + "'");
                        }
                        fullPath = this._constructPath(serviceDefinition, options);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, this._applyMiddlewares(serviceDefinition, options)];
                    case 2:
                        middlewares = _a.sent();
                        fetchOptions = _merge(middlewares, (options && options.fetchOptions) || {}, { method: serviceDefinition.method }, { headers: (options && options.headers) || {} });
                        fetchHeaders = options && options.fetchHeaders;
                        shouldCache = !this._APIOptions.disableCache &&
                            !(serviceDefinition.disableCache || (options && options.disableCache));
                        requestId = void 0;
                        expiration = void 0;
                        if (!shouldCache) return [3 /*break*/, 4];
                        _sha = new sha('SHA-1', 'TEXT');
                        _sha.update(fullPath + ":" + (fetchHeaders ? 'headersOnly' : '') + ":" + JSON.stringify(fetchOptions));
                        requestId = _sha.getHash('HEX');
                        expirationDelay = (options && options.expiration) || serviceDefinition.expiration || this._APIOptions.cacheExpiration;
                        expiration = Date.now() + expirationDelay;
                        return [4 /*yield*/, this._getCachedData(service, requestId)];
                    case 3:
                        cachedData = _a.sent();
                        if (cachedData) {
                            return [2 /*return*/, cachedData];
                        }
                        _a.label = 4;
                    case 4:
                        // Network fetch
                        this._logNetwork(serviceDefinition, fetchHeaders, options);
                        this._log('full URL for request', fullPath);
                        this._log('full fetch options for request', fetchOptions);
                        parsedRes = void 0;
                        return [4 /*yield*/, fetch(fullPath, fetchOptions)];
                    case 5:
                        res = _a.sent();
                        this._log('raw network response', res);
                        if (!fetchHeaders) return [3 /*break*/, 6];
                        parsedRes = res.headers && res.headers.map ? res.headers.map : {};
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, res.json()];
                    case 7:
                        parsedRes = _a.sent();
                        _a.label = 8;
                    case 8:
                        res.ok && shouldCache && this._cache(service, requestId, parsedRes, expiration);
                        return [2 /*return*/, parsedRes];
                    case 9:
                        err_1 = _a.sent();
                        throw new Error(err_1);
                    case 10: return [2 /*return*/];
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
    OfflineFirstAPI.prototype._cache = function (service, requestId, response, expiration) {
        return __awaiter(this, void 0, void 0, function () {
            var err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._log("Caching " + requestId + " ...");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this._addKeyToServiceDictionary(service, requestId, expiration)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._APIDriver.setItem(this._getCacheObjectKey(requestId), JSON.stringify(response))];
                    case 3:
                        _a.sent();
                        this._log("Updated cache for request " + requestId);
                        return [2 /*return*/, true];
                    case 4:
                        err_3 = _a.sent();
                        throw new Error("Error while caching API response for " + requestId);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OfflineFirstAPI.prototype._getCachedData = function (service, requestId) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceDictionary, expiration, cachedData, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._APIDriver.getItem(this._getServiceDictionaryKey(service))];
                    case 1:
                        serviceDictionary = _a.sent();
                        serviceDictionary = JSON.parse(serviceDictionary) || {};
                        expiration = serviceDictionary[requestId];
                        if (!expiration) return [3 /*break*/, 8];
                        this._log(requestId + " already cached, expiring at : " + expiration);
                        if (!(expiration > Date.now())) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._APIDriver.getItem(this._getCacheObjectKey(requestId))];
                    case 3:
                        cachedData = _a.sent();
                        return [2 /*return*/, JSON.parse(cachedData)];
                    case 4:
                        err_4 = _a.sent();
                        throw new Error(err_4);
                    case 5: return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, false];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        this._log(requestId + " not yet cached");
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    OfflineFirstAPI.prototype._addKeyToServiceDictionary = function (service, requestId, expiration) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceDictionaryKey, dictionary, err_5;
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
                        err_5 = _a.sent();
                        throw new Error(err_5);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OfflineFirstAPI.prototype._getServiceDictionaryKey = function (service) {
        return CACHE_PREFIX + ":dictionary:" + service;
    };
    OfflineFirstAPI.prototype._getCacheObjectKey = function (requestId) {
        return CACHE_PREFIX + ":" + requestId;
    };
    OfflineFirstAPI.prototype._applyMiddlewares = function (serviceDefinition, options) {
        return __awaiter(this, void 0, void 0, function () {
            var middlewares, resolvedMiddlewares, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        middlewares = (options && options.middlewares) || serviceDefinition.middlewares || this._APIOptions.middlewares;
                        if (!middlewares.length) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        middlewares = middlewares.map(function (middleware) { return middleware(serviceDefinition, options); });
                        return [4 /*yield*/, Promise.all(middlewares)];
                    case 2:
                        resolvedMiddlewares = _a.sent();
                        return [2 /*return*/, _merge.apply(void 0, resolvedMiddlewares)];
                    case 3:
                        err_6 = _a.sent();
                        throw new Error("Error while applying middlewares for " + serviceDefinition.path + " : " + err_6);
                    case 4: return [3 /*break*/, 6];
                    case 5: return [2 /*return*/, {}];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    OfflineFirstAPI.prototype._constructPath = function (serviceDefinition, options) {
        var domainKey = (options && options.domain) || serviceDefinition.domain;
        var domainURL = this._APIOptions.domains[domainKey];
        var prefixKey = (options && options.prefix) || serviceDefinition.prefix;
        var prefix = this._APIOptions.prefixes[prefixKey];
        var parsedPath = this._parsePath(serviceDefinition, options);
        return domainURL + prefix + '/' + parsedPath;
    };
    OfflineFirstAPI.prototype._parsePath = function (serviceDefinition, options) {
        var path = serviceDefinition.path;
        if (options && options.pathParameters) {
            var pathParameters = options.pathParameters;
            for (var i in pathParameters) {
                path = path.replace(":" + i, pathParameters[i]);
            }
        }
        if (options && options.queryParameters) {
            var queryParameters = options.queryParameters;
            var insertedQueryParameters = 0;
            for (var i in queryParameters) {
                path += insertedQueryParameters === 0 ?
                    "?" + i + "=" + queryParameters[i] :
                    "&" + i + "=" + queryParameters[i];
                insertedQueryParameters++;
            }
        }
        return path;
    };
    OfflineFirstAPI.prototype._mergeAPIOptionsWithDefaultValues = function (options) {
        return __assign({}, DEFAULT_API_OPTIONS, options, { prefixes: __assign({}, DEFAULT_API_OPTIONS.prefixes, (options.prefixes || {})) });
    };
    OfflineFirstAPI.prototype._mergeServicesWithDefaultValues = function (services) {
        var _this = this;
        return _mapValues(services, function (service, serviceName) {
            if (service.domain && !_this._APIOptions.domains[service.domain]) {
                throw new Error("Domain key " + service.domain + " specified for service " + serviceName + " hasn't been declared. \n" +
                    'Please provide it in your OfflineFirstAPI parameters or leave it blank to use the default one.');
            }
            if (service.prefix && !_this._APIOptions.prefixes[service.prefix]) {
                throw new Error("Prefix key " + service.domain + " specified for service " + serviceName + " hasn't been declared. \n" +
                    'Please provide it in your OfflineFirstAPI parameters or leave it blank to use the default one.');
            }
            return __assign({}, DEFAULT_SERVICE_OPTIONS, service);
        });
    };
    OfflineFirstAPI.prototype._logNetwork = function (serviceDefinition, fetchHeaders, options) {
        if (this._APIOptions.printNetworkRequests) {
            console.log("%c Network request " + (fetchHeaders ? '(headers only)' : '') + " for " + serviceDefinition.path + " " +
                ("(" + ((options && options.method) || serviceDefinition.method) + ")"), 'font-weight: bold; color: blue');
        }
    };
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
;
;
;
;
