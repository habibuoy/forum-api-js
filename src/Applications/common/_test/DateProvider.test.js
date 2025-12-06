const DateProvider = require('../DateProvider');

describe('a DateProvider interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const dateProvider = new DateProvider();

    // Action & Assert
    expect(() => dateProvider.getUtcNowString()).toThrow('DATE_PROVIDER.METHOD_NOT_IMPLEMENTED');
  });
});
