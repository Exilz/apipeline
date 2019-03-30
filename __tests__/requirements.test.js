import 'whatwg-fetch';

describe('>>> Requirements', () => {
  it('Fetch is polyfilled', () => {
    expect(window.fetch).toBeDefined();
  });
});
