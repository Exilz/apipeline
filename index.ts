import * as _mapValues from 'lodash.mapvalues';

const DEFAULT_API_OPTIONS = {
    debugAPI: false,
    prefixes: { default: '/' },
    printNetworkRequests: false,
    disableCache: false,
    cacheExpiration: 24 * 3600 * 1000,
    updateDelay: 5 * 60 * 1000
};

const DEFAULT_SERVICE_OPTIONS = {
    method: 'GET',
    domain: 'default',
    prefix: 'default'
};

export default class OfflineFirstAPI {

    private _APIOptions: IAPIOptions;
    private _APIServices: IAPIServices = {};

    constructor (options: IAPIOptions, services: IAPIServices) {
        options && this.setOptions(options);
        services && this.setServices(services);
    }

    public async fetch (service: string, options?: IFetchOptions) {
        const serviceDefinition: IAPIService = this._APIServices[service];
        if (!serviceDefinition) {
            throw new Error(`Cannot fetch data from unregistered service '${service}'`);
        }
        const fullPath = this._constructPath(serviceDefinition, options);

        try {
            const res = await fetch(
                fullPath,
                {
                    ...options.fetchOptions,
                    method: serviceDefinition.method,
                    headers: options.headers || {}
                }
            );
            console.log('res', res);
            const data = await res.json();
            console.log('data', data);
            return data;
        } catch (err) {
            throw new Error(err);
        }
    }

    public setOptions (options: IAPIOptions) {
        this._APIOptions = this._mergeAPIOptionsWithDefaultValues(options);
        console.log('options', this._APIOptions);

        if (!this._APIOptions.domains.default) {
            throw new Error(
                "You didn't set your default domain URL in your options. \n " +
                "new OfflineFirstAPI({ domains: { default: 'http://myApi.net' } }, ...)"
            );
        }
    }

    public setServices (services: IAPIServices) {
        this._APIServices = this._mergeServicesWithDefaultValues(services);
        console.log('services', this._APIServices);
    }

    private _constructPath (serviceDefinition: IAPIService, options?: IFetchOptions): string {
        const domainKey = (options && options.domain) || serviceDefinition.domain;
        const domainURL = this._APIOptions.domains[domainKey];
        const prefixKey = (options && options.prefix) || serviceDefinition.prefix;
        const prefix = this._APIOptions.prefixes[prefixKey];
        const parsedPath = this._parsePath(serviceDefinition, options);

        return domainURL + prefix + '/' + parsedPath;
    }

    private _parsePath (serviceDefinition: IAPIService, options: IFetchOptions): string {
        const { pathParameters, queryParameters } = options;
        let path = serviceDefinition.path;

        if (pathParameters) {
            for (let i in pathParameters) {
                path = path.replace(`:${i}`, pathParameters[i]);
            }
        }
        if (queryParameters) {
            let insertedQueryParameters = 0;
            for (let i in queryParameters) {
                path += insertedQueryParameters === 0 ?
                    `?${i}=${queryParameters[i]}` :
                    `&${i}=${queryParameters[i]}`;
                insertedQueryParameters++;
            }
        }
        return path;
    }

    private _mergeAPIOptionsWithDefaultValues (options: IAPIOptions) {
        return {
            ...DEFAULT_API_OPTIONS,
            ...options,
            prefixes: {
                ...DEFAULT_API_OPTIONS.prefixes,
                ...(options.prefixes || {})
            }
        };
    }

    private _mergeServicesWithDefaultValues (services: IAPIServices): IAPIServices {
        return _mapValues(services, (service: IAPIService, serviceName: string) => {
            if (service.domain && !this._APIOptions.domains[service.domain]) {
                throw new Error(
                    `Domain key ${service.domain} specified for service ${serviceName} hasn't been declared. \n` +
                    'Please provide it in your OfflineFirstAPI parameters or leave it blank to use the default one.'
                );
            }
            if (service.prefix && !this._APIOptions.prefixes[service.prefix]) {
                throw new Error(
                    `Prefix key ${service.domain} specified for service ${serviceName} hasn't been declared. \n` +
                    'Please provide it in your OfflineFirstAPI parameters or leave it blank to use the default one.'
                );
            }
            return {
                ...DEFAULT_SERVICE_OPTIONS,
                ...service
            };
        });
    }
}

interface IAPIOptions {
    domains: { default: string, [key: string]: string };
    prefixes: { default: string, [key: string]: string };
    debugAPI?: boolean;
    printNetworkRequests?: boolean;
    disableCache?: boolean;
    cacheExpiration?: number;
    updateDelay?: number;
    // offlineDriver: ...
};

interface IAPIService {
    path: string;
    expiration?: number;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE';
    domain?: string;
    prefix?: string;
};

interface IFetchOptions extends IAPIService {
    pathParameters?: { [key: string]: string };
    queryParameters?: { [key: string]: string };
    headers?: { [key: string]: string };
    fetchOptions?: any;
};

interface IAPIServices {
    [key: string]: IAPIService;
};
