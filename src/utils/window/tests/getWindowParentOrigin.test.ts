describe('getWindowParentOrigin', () => {
  let windowSpy: jest.SpyInstance;

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should return origin from document.referrer when available', () => {
    const mockReferrer = 'https://example.com/some/path';
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: mockReferrer
    });

    const { getWindowParentOrigin } = require('../getWindowParentOrigin');
    expect(getWindowParentOrigin()).toBe('https://example.com');
  });

  it('should return origin from ancestorOrigins when referrer is not available', () => {
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: ''
    });

    const mockAncestorOrigins = {
      length: 2,
      0: 'https://first.com',
      1: 'https://second.com'
    };

    windowSpy.mockImplementation(() => ({
      location: {
        ancestorOrigins: mockAncestorOrigins
      }
    }));

    const { getWindowParentOrigin } = require('../getWindowParentOrigin');
    expect(getWindowParentOrigin()).toBe('https://second.com');
  });

  it('should return empty string when no ancestorOrigins are available', () => {
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: ''
    });

    windowSpy.mockImplementation(() => ({
      location: {
        ancestorOrigins: { length: 0 }
      }
    }));

    const { getWindowParentOrigin } = require('../getWindowParentOrigin');
    expect(getWindowParentOrigin()).toBe('');
  });

  it('should return empty string and log error when URL is invalid', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'invalid-url'
    });

    const { getWindowParentOrigin } = require('../getWindowParentOrigin');
    expect(getWindowParentOrigin()).toBe('');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
