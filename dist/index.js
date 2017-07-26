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
var _mapValues = require("lodash.mapvalues");
var DEFAULT_API_OPTIONS = {
    debugAPI: false,
    prefixes: { default: '/' },
    printNetworkRequests: false,
    disableCache: false,
    cacheExpiration: 24 * 3600 * 1000,
    updateDelay: 5 * 60 * 1000
};
var DEFAULT_SERVICE_OPTIONS = {
    method: 'GET',
    domain: 'default',
    prefix: 'default'
};
var OfflineFirstAPI = (function () {
    function OfflineFirstAPI(options, services) {
        this._APIServices = {};
        options && this.setOptions(options);
        services && this.setServices(services);
    }
    OfflineFirstAPI.prototype.fetch = function (service, options) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceDefinition, fullPath, res, data, err_1;
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
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(fullPath, __assign({}, options.fetchOptions, { method: serviceDefinition.method, headers: options.headers || {} }))];
                    case 2:
                        res = _a.sent();
                        console.log('res', res);
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _a.sent();
                        console.log('data', data);
                        return [2 /*return*/, data];
                    case 4:
                        err_1 = _a.sent();
                        throw new Error(err_1);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OfflineFirstAPI.prototype.setOptions = function (options) {
        this._APIOptions = this._mergeAPIOptionsWithDefaultValues(options);
        console.log('options', this._APIOptions);
        if (!this._APIOptions.domains.default) {
            throw new Error("You didn't set your default domain URL in your options. \n " +
                "new OfflineFirstAPI({ domains: { default: 'http://myApi.net' } }, ...)");
        }
    };
    OfflineFirstAPI.prototype.setServices = function (services) {
        this._APIServices = this._mergeServicesWithDefaultValues(services);
        console.log('services', this._APIServices);
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
        var pathParameters = options.pathParameters, queryParameters = options.queryParameters;
        var path = serviceDefinition.path;
        if (pathParameters) {
            for (var i in pathParameters) {
                path = path.replace(":" + i, pathParameters[i]);
            }
        }
        if (queryParameters) {
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
    return OfflineFirstAPI;
}());
exports.default = OfflineFirstAPI;
;
;
;
;
