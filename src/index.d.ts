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

declare module "react-native-offline-api" {
    export class OfflineFirstAPI {
        constructor (options: IAPIOptions, services: IAPIServices, driver?: IAPIDriver);
        public fetch (service: string, options?: IFetchOptions): Promise<any>;
        public fetchHeaders (service: string, options?: IFetchOptions): Promise<any>;
        public clearCache (service?: string): Promise<void>;
        public setOptions (options: IAPIOptions): void;
        public setServices (services: IAPIServices): void;
        public setCacheDriver (driver: IAPIDriver): void;
    }
}
