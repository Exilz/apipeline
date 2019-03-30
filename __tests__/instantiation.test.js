import APIpeline from '../dist';

const API_OPTIONS = {
  fetchMethod: require('whatwg-fetch'),
  domains: { default: 'http://default.tld' }
};

const API_SERVICES = {
  example: { path: 'example' }
};

describe('>>> Instantiation', () => {

  it('Success with options and services', () => {
    new APIpeline(API_OPTIONS, API_SERVICES);
  });

  it('Success without services', () => {
    new APIpeline(API_OPTIONS);
  });

  it('Fails when fetchMethod is missing', () => {
    expect(() => {
      new APIpeline({ ...API_OPTIONS, fetchMethod: undefined }, API_SERVICES);
    }).toThrow(/^Your fetch method is undefined/);
  });

  it('Fails when default domain is missing', () => {
    expect(() => {
      new APIpeline({ ...API_OPTIONS, domains: { staging: 'http://staging.myapi.tld' } }, API_SERVICES);
    }).toThrow(/^You didn't set your default domain URL in your options/);
  });
});
