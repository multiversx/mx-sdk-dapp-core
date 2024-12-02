import { generateBatchTransactionsGrouping } from '../generateBatchTransactionsGrouping';

describe('generateBatchTransactionsGrouping', () => {
  it('should generate correct indices for empty array', () => {
    const result = generateBatchTransactionsGrouping([]);
    expect(result).toEqual([]);
  });

  it('should generate correct indices for single group', () => {
    const input = [[1, 2, 3]];
    const result = generateBatchTransactionsGrouping(input);
    expect(result).toEqual([[0, 1, 2]]);
  });

  it('should generate correct indices for multiple groups', () => {
    const input = [[1, 2], [3, 4], [5]];
    const result = generateBatchTransactionsGrouping(input);
    expect(result).toEqual([[0, 1], [2, 3], [4]]);
  });

  it('should handle groups of different sizes', () => {
    const input = [[1], [2, 3, 4], [5, 6]];
    const result = generateBatchTransactionsGrouping(input);
    expect(result).toEqual([[0], [1, 2, 3], [4, 5]]);
  });
});
