import APIpeline, { HTTP_METHODS } from '../dist';

const API_OPTIONS = {
  fetchMethod: require('whatwg-fetch'),
  domains: { default: 'http://default.tld' }
};


describe('>>> Unit tests', () => {

  it('Implements every HTTP methods', () => {
    const api = new APIpeline(API_OPTIONS);
    HTTP_METHODS.forEach((method) => {
      expect(typeof api[method.toLowerCase()]).toBe('function');
    });
  })
});
