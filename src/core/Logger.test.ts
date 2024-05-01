import { Logger } from './Logger';

describe('Logger', () => {
  it('should call log with correct arguments', () => {
    const logger = Logger;
    const mockLog = jest.spyOn(logger, 'log');
    const message = 'Test message';

    logger.log(message);

    expect(mockLog).toHaveBeenCalledWith(message);
  });
});
