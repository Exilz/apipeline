import APIpeline, { DEFAULT_API_OPTIONS, DEFAULT_SERVICE_OPTIONS } from '../dist';

const API_OPTIONS = {
  fetchMethod: require('whatwg-fetch'),
  domains: { default: 'http://default.tld' }
};

describe('>>> Setup API options and services', () => {

  it('Merges the default API options for missing keys', () => {
    const api = new APIpeline(API_OPTIONS);
    expect(api._APIOptions).toStrictEqual({
      ...DEFAULT_API_OPTIONS,
      ...API_OPTIONS,
    });
  });

  it('Merges the default services options for each service', () => {
    const SERVICES = { default: { path: '/' }, simpleService: { path: 'simpleService', method: 'POST' } };
    const api = new APIpeline(API_OPTIONS, SERVICES);
    expect(api._APIServices).toStrictEqual({
      default: { ...DEFAULT_SERVICE_OPTIONS, ...SERVICES.default,  },
      simpleService: { ...DEFAULT_SERVICE_OPTIONS, ...SERVICES.simpleService },
    });
  });

  it('Updates API options after instantiation', () => {
    const api = new APIpeline(API_OPTIONS);
    const UPDATED_OPTIONS = { printNetworkRequests: true };
    api.setOptions(UPDATED_OPTIONS);
    expect(api._APIOptions).toStrictEqual({
      ...DEFAULT_API_OPTIONS,
      ...API_OPTIONS,
      ...UPDATED_OPTIONS
    });
  });

  it('Sets up services after instantiation without pre-defined services', () => {
    const UPDATED_SERVICES = { newService: { path: 'http://myNewService.tld' } };
    const api = new APIpeline(API_OPTIONS);
    api.setServices(UPDATED_SERVICES);
    expect(api._APIServices).toStrictEqual({
      newService: {
        ...UPDATED_SERVICES.newService,
        ...DEFAULT_SERVICE_OPTIONS
      }
    });
  });

  it('Adds a new service after instantiation with pre-defined services', () => {
    const PRE_DEF_SERVICES = { default: { path: 'http://default.tld' } };
    const UPDATED_SERVICES = { newService: 'http://myNewService.tld' };
    const api = new APIpeline(API_OPTIONS, PRE_DEF_SERVICES);
    api.setServices(UPDATED_SERVICES);
    expect(api._APIServices).toStrictEqual({
      default: {
        ...PRE_DEF_SERVICES.default,
        ...DEFAULT_SERVICE_OPTIONS
      },
      newService: {
        ...UPDATED_SERVICES.newService,
        ...DEFAULT_SERVICE_OPTIONS
      }
    });
  });
});
