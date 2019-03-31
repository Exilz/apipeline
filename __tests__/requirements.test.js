import APIpeline from '../dist/index';

const API_OPTIONS = {
  fetchMethod: require('whatwg-fetch'),
  domains: { default: 'default' }
};

describe('>>> Requirements', () => {
  it('Fetch is polyfilled', () => {
    new APIpeline(API_OPTIONS);
  });
});
