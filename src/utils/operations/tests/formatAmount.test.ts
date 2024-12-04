import { formatAmount } from '../formatAmount';

describe('formatAmount', () => {
  describe('format with 4,4', () => {
    test.each([
      ['9999999999999999999999990000', '999,999,999,999,999,999,999,999'],
      ['0', '0']
    ])('format %s -> %s', (input, expected) => {
      const withCommas = formatAmount({
        input,
        decimals: 4,
        digits: 4,
        showLastNonZeroDecimal: false,
        addCommas: true
      });
      expect(withCommas).toBe(expected);
    });
  });

  describe('format with 8,4', () => {
    test.each([
      ['9999999999999999999899996000', '99,999,999,999,999,999,998.9999'],
      ['0', '0'],
      ['10000', '0.0001']
    ])('format %s -> %s', (input, expected) => {
      const withCommas = formatAmount({
        input,
        decimals: 8,
        digits: 4,
        showLastNonZeroDecimal: false,
        addCommas: true
      });
      expect(withCommas).toBe(expected);
    });
  });

  describe('format with 0,0', () => {
    test.each([['350', '350']])('format %s -> %s', (input, expected) => {
      const withCommas = formatAmount({
        input,
        decimals: 0,
        digits: 0,
        showLastNonZeroDecimal: false
      });
      expect(withCommas).toBe(expected);
    });
  });

  describe('format with 4,8,true', () => {
    test.each([['12345678901234567890123', '123,456,789,012,345.67890123']])(
      'format %s -> %s',
      (input, expected) => {
        const withCommas = formatAmount({
          input,
          decimals: 8,
          digits: 4,
          showLastNonZeroDecimal: true,
          addCommas: true
        });
        expect(withCommas).toBe(expected);
      }
    );
  });

  describe('format with 18,0,true', () => {
    test.each([
      ['102000000000000000', '0.102'],
      ['100000000000000000', '0.1'],
      ['1000000000000000000', '1']
    ])('format %s -> %s', (input, expected) => {
      const withCommas = formatAmount({
        input,
        decimals: 18,
        digits: 0,
        showLastNonZeroDecimal: true
      });
      expect(withCommas).toBe(expected);
    });
  });

  describe('format with float throws error', () => {
    test.each([['0.015'], ['01000000000000000000']])(
      'format %s throws error',
      (input) => {
        expect(() => {
          formatAmount({
            input,
            decimals: 18,
            digits: 4,
            addCommas: false,
            showLastNonZeroDecimal: true
          });
        }).toThrow('Invalid input');
      }
    );
  });

  describe('format with negative', () => {
    test.each([
      ['-922506751086064008', '-0.922506751086064008'],
      ['-578345000000000000000', '-578.3450'],
      ['-1578345000000000000000', '-1,578.3450'],
      ['-3456000000000000000', '-3.4560']
    ])('format %s -> %s', (input, expected) => {
      const withCommas = formatAmount({
        input,
        decimals: 18,
        digits: 4,
        showLastNonZeroDecimal: true,
        addCommas: true
      });
      expect(withCommas).toBe(expected);
    });
  });

  describe('format with single tests', () => {
    test('should show less than if decimal amount is too low', () => {
      const result = formatAmount({
        input: (100_000_000_000_000).toString(),
        digits: 2,
        showIsLessThanDecimalsLabel: true,
        showLastNonZeroDecimal: false
      });
      expect(result).toBe('<0.01');
    });

    test('should not show digits when result is below 1', () => {
      const result = formatAmount({
        input: (100_000_000_000_000).toString(),
        showLastNonZeroDecimal: false,
        digits: 2
      });
      expect(result).toBe('0');
    });

    test('should show zero digits for integers with decimal amount too low', () => {
      const result = formatAmount({
        input: ['1', '000', '000', '001', '000', '000', '000', '000'].join(''),
        digits: 2,
        showLastNonZeroDecimal: false
      });
      expect(result).toBe('1000.00');
    });

    test('should show a valid number if showLastNonZeroDecimal is set', () => {
      const result = formatAmount({
        input: (1_000_000_000).toString(),
        digits: 4,
        showLastNonZeroDecimal: true
      });
      expect(result).toBe('0.000000001');
    });

    test('should show remove digits and not add commas', () => {
      const result = formatAmount({
        input: '369884288127092846270928',
        digits: 4,
        showLastNonZeroDecimal: false,
        addCommas: false
      });
      expect(result).toBe('369884.2881');
    });

    test('should not add . at the end for 0 digits', () => {
      const result = formatAmount({
        input: '369884288127092846270928',
        digits: 0,
        showLastNonZeroDecimal: false,
        addCommas: false
      });
      expect(result).toBe('369884');
    });
  });

  describe('should show all 4 digits', () => {
    test.each([['995000000000000000', '0.9950']])(
      'format %s -> %s',
      (input, expected) => {
        const withCommas = formatAmount({
          input,
          decimals: 18,
          digits: 4,
          showLastNonZeroDecimal: true,
          addCommas: true
        });
        expect(withCommas).toBe(expected);
      }
    );
  });
});
