import { formatAmount } from '../formatAmount';

describe('formatAmount', () => {
  test('throws error for invalid input', () => {
    expect(() => formatAmount({ input: 'abc' })).toThrow('Invalid input');
    expect(() => formatAmount({ input: '1.23' })).toThrow('Invalid input');
    expect(() => formatAmount({ input: '-1.23' })).toThrow('Invalid input');
  });

  test('handles zero values', () => {
    expect(formatAmount({ input: '0' })).toBe('0');
    expect(formatAmount({ input: '0', digits: 2 })).toBe('0');
  });

  test('formats positive integers', () => {
    expect(formatAmount({ input: '1000000000000000000' })).toBe('1.0000');
    expect(formatAmount({ input: '2000000000000000000' })).toBe('2.0000');
  });

  test('formats negative integers', () => {
    expect(formatAmount({ input: '-1000000000000000000' })).toBe('-1.0000');
    expect(formatAmount({ input: '-2000000000000000000' })).toBe('-2.0000');
  });

  test('handles custom decimals', () => {
    expect(formatAmount({ input: '1000000000000000000', decimals: 8 })).toBe(
      '10000000000.0000'
    );

    expect(formatAmount({ input: '1000000000000000000', decimals: 4 })).toBe(
      '100000000000000.0000'
    );

    expect(
      formatAmount({ input: '56817349973594872345', decimals: 18, digits: 4 })
    ).toBe('56.8173');
  });

  test('handles custom digits', () => {
    expect(formatAmount({ input: '1000000000000000000', digits: 2 })).toBe(
      '1.00'
    );

    expect(formatAmount({ input: '1000000000000000000', digits: 4 })).toBe(
      '1.0000'
    );
  });

  test('adds commas when specified', () => {
    expect(
      formatAmount({ input: '1000000000000000000000', addCommas: true })
    ).toBe('1,000.0000');

    expect(
      formatAmount({
        input: '1000000000000000000000',
        addCommas: true,
        digits: 2
      })
    ).toBe('1,000.00');
  });

  test('handles showIsLessThanDecimalsLabel', () => {
    const input = '1000000000000000';
    expect(
      formatAmount({
        input,
        showIsLessThanDecimalsLabel: true,
        digits: 2
      })
    ).toBe('<0.01');
  });

  test('handles showLastNonZeroDecimal', () => {
    expect(
      formatAmount({
        input: '1100000000000000000',
        showLastNonZeroDecimal: true,
        digits: 4
      })
    ).toBe('1.1000');

    expect(
      formatAmount({
        input: '1100000000000000000',
        showLastNonZeroDecimal: false,
        digits: 4
      })
    ).toBe('1.1');
  });
});
