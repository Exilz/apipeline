import {
    IAPIOptions,
    IAPIService,
    IAPIServices,
    IFetchOptions,
    IFetchResponse,
    ICachedData,
    IAPICacheDriver,
    APIMiddleware
} from './interfaces';

import { ISQLiteBinding, ISQLiteDriverOptions } from './drivers/sqlite';

declare module "apipeline" {
    export const drivers: {
        sqliteDriver: (SQLite: ISQLiteBinding, options: ISQLiteDriverOptions) => Promise<IAPICacheDriver>
    };

    export default class APIPeline {
        constructor (options: IAPIOptions, services: IAPIServices, driver?: IAPICacheDriver);
        public fetch (service: string, options?: IFetchOptions): Promise<any>;
        public fetchHeaders (service: string, options?: IFetchOptions): Promise<any>;
        public clearCache (service?: string): Promise<void>;
        public setOptions (options: IAPIOptions): void;
        public setServices (services: IAPIServices): void;
        public setCacheDriver (driver: IAPICacheDriver): void;
        // HTTP methods shorthands
        public get (service: string, options?: IFetchOptions): Promise<any>;
        public head (service: string, options?: IFetchOptions): Promise<any>;
        public post (service: string, options?: IFetchOptions): Promise<any>;
        public put (service: string, options?: IFetchOptions): Promise<any>;
        public delete (service: string, options?: IFetchOptions): Promise<any>;
        public connect (service: string, options?: IFetchOptions): Promise<any>;
        public options (service: string, options?: IFetchOptions): Promise<any>;
        public trace (service: string, options?: IFetchOptions): Promise<any>;
    }
}
