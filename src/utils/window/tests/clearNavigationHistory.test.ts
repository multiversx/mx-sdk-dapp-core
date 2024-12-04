import { clearNavigationHistory } from '../clearNavigationHistory';
import { getWindowLocation } from '../getWindowLocation';

jest.mock('../getWindowLocation');

describe('clearNavigationHistory', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window.history, 'replaceState').mockImplementation();
    (getWindowLocation as jest.Mock).mockReturnValue({
      pathname: '/test',
      hash: '#section1'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('should update history with new URL params', () => {
    const params = { page: '1', sort: 'desc' };
    clearNavigationHistory(params);

    jest.runAllTimers();

    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      document.title,
      '/test?page=1&sort=desc#section1'
    );
  });

  test('should handle empty params', () => {
    clearNavigationHistory({});

    jest.runAllTimers();

    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      document.title,
      '/test#section1'
    );
  });

  test('should use default path when pathname is empty', () => {
    (getWindowLocation as jest.Mock).mockReturnValue({
      pathname: '',
      hash: ''
    });

    clearNavigationHistory({});

    jest.runAllTimers();

    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      document.title,
      './'
    );
  });

  test('should handle hash fragments', () => {
    const params = { filter: 'active' };
    clearNavigationHistory(params);

    jest.runAllTimers();

    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      document.title,
      '/test?filter=active#section1'
    );
  });
});
