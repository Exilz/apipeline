import {
    IAPIOptions,
    IAPIService,
    IAPIServices,
    IFetchOptions,
    IFetchResponse,
    ICachedData,
    IAPIDriver,
    APIMiddleware
} from './interfaces';

import { ISQLiteBinding, ISQLiteDriverOptions } from './drivers/sqlite';

declare module "react-native-offline-api" {
    export const drivers: {
        sqliteDriver: (SQLite: ISQLiteBinding, options: ISQLiteDriverOptions) => Promise<IAPIDriver>
    };

    export default class OfflineFirstAPI {
        constructor (options: IAPIOptions, services: IAPIServices, driver?: IAPIDriver);
        public fetch (service: string, options?: IFetchOptions): Promise<any>;
        public fetchHeaders (service: string, options?: IFetchOptions): Promise<any>;
        public clearCache (service?: string): Promise<void>;
        public setOptions (options: IAPIOptions): void;
        public setServices (services: IAPIServices): void;
        public setCacheDriver (driver: IAPIDriver): void;
    }
}
