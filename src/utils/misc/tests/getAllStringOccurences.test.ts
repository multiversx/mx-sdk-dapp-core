import { getAllStringOccurrences } from '../getAllStringOccurrences';

describe('getAllStringOccurrences', () => {
  test('basic functionality with single character', () => {
    expect(getAllStringOccurrences('hello world', 'o')).toEqual([4, 7]);
  });

  test('case sensitivity', () => {
    expect(getAllStringOccurrences('Hello World', 'o')).toEqual([4, 7]);
    expect(getAllStringOccurrences('Hello World', 'O')).toEqual([]);
  });

  test('no occurrences', () => {
    expect(getAllStringOccurrences('hello world', 'z')).toEqual([]);
  });

  test('multiple occurrences of substring', () => {
    expect(getAllStringOccurrences('banana', 'ana')).toEqual([1, 3]);
  });

  test('overlapping occurrences', () => {
    expect(getAllStringOccurrences('aaa', 'aa')).toEqual([0, 1]);
  });

  test('empty search string', () => {
    expect(getAllStringOccurrences('hello', '')).toEqual([]);
  });

  test('empty source string', () => {
    expect(getAllStringOccurrences('', 'hello')).toEqual([]);
  });

  test('entire string match', () => {
    expect(getAllStringOccurrences('test', 'test')).toEqual([0]);
  });

  test('multiple character occurrences', () => {
    expect(getAllStringOccurrences('test test test', 'test')).toEqual([
      0, 5, 10
    ]);
  });
});
