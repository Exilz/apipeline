import APIpeline from '../dist/index';
import 'whatwg-fetch';
import exampleData from './static/example';
import server from './server';

const API_OPTIONS = {
  fetchMethod: window.fetch,
  domains: { default: 'http://127.0.0.1:23135' }
};

const API_SERVICES = {
  testHeaders: { path: 'testHeaders' },
  getExample: { path: 'example.json' },
  postExample: { path: 'postExample', method: 'POST' }
};


describe('>>> Test API calls', () => {
  let mockedServer;
  beforeAll((done) => {
    mockedServer = server.listen(23135, done);
  });

  afterAll((done) => {
    mockedServer.close(done);
  });

  it('Returns headers', async () => {
    const api = new APIpeline(API_OPTIONS, API_SERVICES);
    try {
      await expect(
        api.get('testHeaders', { headers: { 'Content-Type': 'application/pdf' } })
      ).resolves.toHaveProperty('content-type', 'application/pdf');
    } catch (err) {
      throw err;
    }
  });

  it('GET/example.json (api.get)', async () => {
    const api = new APIpeline(API_OPTIONS, API_SERVICES);
    await expect(api.get('getExample')).resolves.toEqual(exampleData);
  });

  it('GET/example.json (api.fetch)', async () => {
    const api = new APIpeline(API_OPTIONS, API_SERVICES);
    await expect(api.fetch('getExample')).resolves.toEqual(exampleData);
  });

  it('GET/example.json (api.getHeaders)', async () => {
    const api = new APIpeline(API_OPTIONS, API_SERVICES);
    expect.assertions(2);
    try {
      const headers = await api.fetchHeaders('getExample');
      expect(headers).toHaveProperty('content-type');
      expect(headers['content-type']).toEqual('application/json; charset=UTF-8');
    } catch (err) {
      throw err;
    }
  });

  it('POST/postExample (api.post)', async () => {
    const api = new APIpeline(API_OPTIONS, API_SERVICES);
    try {
      await expect(api.post(
        'postExample',
        {
          fetchOptions: { body: 'key=value' },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      )).resolves.toEqual({ key: 'value' });
    } catch (err) {
      throw err;
    }
  });
});
