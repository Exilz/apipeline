import APIpeline from '../dist/index';
import 'whatwg-fetch';
import exampleData from './static/example';
import server from './server';

const API_OPTIONS = {
  fetchMethod: window.fetch,
  domains: { default: 'http://127.0.0.1:23135' }
};

const API_SERVICES = {
  example: { path: 'example.json' }
};


describe('>>> Test API calls', () => {
  let mockedServer;
  beforeAll((done) => {
    mockedServer = server.listen(23135, done);
  });

  afterAll((done) => {
    mockedServer.close(done);
  });

  it('GET/example.json (api.get)', async () => {
    const api = new APIpeline(API_OPTIONS, API_SERVICES);
    await expect(api.get('example')).resolves.toEqual(exampleData);
  });

  it('GET/example.json (api.fetch)', async () => {
    const api = new APIpeline(API_OPTIONS, API_SERVICES);
    await expect(api.fetch('example')).resolves.toEqual(exampleData);
  });

  it('GET/example.json (api.getHeaders)', async () => {
    const api = new APIpeline(API_OPTIONS, API_SERVICES);
    expect.assertions(2);
    try {
      const headers = await api.fetchHeaders('example');
      expect(headers).toHaveProperty('content-type');
      expect(headers['content-type']).toEqual('application/json; charset=UTF-8');
    } catch (err) {
      throw err;
    }
  });
});

