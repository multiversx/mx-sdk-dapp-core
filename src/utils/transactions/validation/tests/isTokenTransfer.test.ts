import { isTokenTransfer } from '../isTokenTransfer';

describe('isTokenTransfer', () => {
  it('should return true when tokenId exists and differs from erdLabel', () => {
    const result = isTokenTransfer({
      tokenId: 'USDC-123456',
      erdLabel: 'EGLD'
    });
    expect(result).toBe(true);
  });

  it('should return false when tokenId is undefined', () => {
    const result = isTokenTransfer({
      tokenId: undefined,
      erdLabel: 'EGLD'
    });
    expect(result).toBe(false);
  });

  it('should return false when tokenId equals erdLabel', () => {
    const result = isTokenTransfer({
      tokenId: 'EGLD',
      erdLabel: 'EGLD'
    });
    expect(result).toBe(false);
  });

  it('should return false when tokenId is empty string', () => {
    const result = isTokenTransfer({
      tokenId: '',
      erdLabel: 'EGLD'
    });
    expect(result).toBe(false);
  });
});
