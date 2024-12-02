import { getIsSequential } from '../getIsSequential';

describe('getIsSequential', () => {
  test('should return true for nested array transactions', () => {
    const transactions = [[{ id: 1 }, { id: 2 }], [{ id: 3 }]];

    expect(getIsSequential({ transactions })).toBe(true);
  });

  test('should return false for flat array transactions', () => {
    const transactions = [{ id: 1 }, { id: 2 }, { id: 3 }];

    expect(getIsSequential({ transactions })).toBe(false);
  });

  test('should return undefined for undefined transactions', () => {
    expect(getIsSequential({ transactions: undefined })).toBe(undefined);
  });

  test('should return false for empty array', () => {
    expect(getIsSequential({ transactions: [] })).toBe(false);
  });
});
