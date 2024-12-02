import { sequentialToFlatArray } from '../sequentialToFlatArray';

describe('sequentialToFlatArray', () => {
  it('should handle empty array input', () => {
    const result = sequentialToFlatArray({ transactions: [] });
    expect(result).toEqual([]);
  });

  it('should return same array when input is flat', () => {
    const input = [1, 2, 3];
    const result = sequentialToFlatArray({ transactions: input });
    expect(result).toEqual([1, 2, 3]);
  });

  it('should flatten sequential nested arrays', () => {
    const input = [[1, 2], [3, 4], [5]];
    const result = sequentialToFlatArray({ transactions: input });
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle mixed type arrays', () => {
    const input = [
      ['a', 'b'],
      ['c', 'd']
    ];
    const result = sequentialToFlatArray({ transactions: input });
    expect(result).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should flatten array near non-array element', () => {
    const input = [[1, 2], 3];
    const result = sequentialToFlatArray({ transactions: input });
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle undefined input', () => {
    const result = sequentialToFlatArray({});
    expect(result).toEqual([]);
  });
});
