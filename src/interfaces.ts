export interface IAPIOptions {
    domains: { default: string, [key: string]: string };
    prefixes: { default: string, [key: string]: string };
    middlewares?: APIMiddleware[];
    debugAPI?: boolean;
    printNetworkRequests?: boolean;
    disableCache?: boolean;
    cacheExpiration?: number;
    cachePrefix?: string;
    ignoreHeadersWhenCaching?: boolean;
    capServices?: boolean;
    capLimit?: number;
    offlineDriver?: IAPIDriver;
};

export interface IAPIService {
    path: string;
    expiration?: number;
    method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE';
    domain?: string;
    prefix?: string;
    middlewares?: APIMiddleware[];
    ignoreHeadersWhenCaching?: boolean;
    disableCache?: boolean;
    capService?: boolean;
    capLimit?: number;
    rawData?: boolean;
};

export interface IAPIServices {
    [key: string]: IAPIService;
};

export interface IFetchOptions extends IAPIService {
    pathParameters?: { [key: string]: string };
    queryParameters?: { [key: string]: string };
    headers?: { [key: string]: string };
    fetchHeaders?: boolean;
    middlewares?: APIMiddleware[];
    fetchOptions?: any;
};

export interface IFetchResponse {
    success: boolean;
    data?: any;
}

export interface ICachedData {
    success: boolean;
    data?: any;
    fresh?: boolean;
}

export interface ICacheDictionary {
    [key: string]: number;
}

export interface IAPIDriver {
    getItem(key: string, callback?: (error?: Error, result?: string) => void);
    setItem(key: string, value: string, callback?: (error?: Error) => void);
    removeItem(key: string, callback?: (error?: Error) => void);
    multiRemove(keys: string[], callback?: (errors?: Error[]) => void);
}

export interface IMiddlewarePaths {
    fullPath: string;
    withoutQueryParams: string;
}

export type APIMiddleware = (serviceDefinition: IAPIService, paths: IMiddlewarePaths, options?: IFetchOptions) => any;
