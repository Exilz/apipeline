import APIpeline from 'apipeline';
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
            'User-Agent': 'apipeline (https://github.com/Exilz/apipeline)',
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
    new APIpeline(API_OPTIONS, API_SERVICES) :
    new APIpeline(API_OPTIONS, API_SERVICES, localforage);

export default api;
