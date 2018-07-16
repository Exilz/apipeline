import OfflineAPI from 'react-native-offline-api';
import clientFetch from 'unfetch';
import serverFetch from 'isomorphic-unfetch';
import localforage from 'localforage';

const isServer = typeof window === 'undefined';

const API_OPTIONS = {
    fetchMethod: isServer ? serverFetch : clientFetch,
    domains: { default: 'https://icanhazdadjoke.com' },
    prefixes: { default: '' },
    printNetworkRequests: !isServer,
    debugAPI: !isServer,
    disableCache: false,
    middlewares: [() => ({
        headers: {
            'User-Agent': 'react-native-offline-api (https://github.com/Exilz/react-native-offline-api/blob/master/docs/middlewares.md)',
            'Accept': 'application/json'
        }
    })]
};

const API_SERVICES = {
    random: { path: '', expiration: 5 * 1000, responseMiddleware: (res) => ({ ...res, timestamp: Date.now() }) },
    search: {
        path: 'search',
        responseMiddleware: (res) => (
            {
                ...res,
                results: res.results.map((result) => ({ ...result, timestamp: Date.now()} ))
            }
        )
    }
};

const api = isServer ?
    new OfflineAPI(API_OPTIONS, API_SERVICES) :
    new OfflineAPI(API_OPTIONS, API_SERVICES, localforage);

export default api;
