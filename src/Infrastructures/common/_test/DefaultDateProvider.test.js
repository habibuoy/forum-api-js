const DefaultDateProvider = require('../DefaultDateProvider');

describe('DefaultDateProvider', () => {
  it('should return a date string correctly', () => {
    const provider = new DefaultDateProvider();

    const utcNow = new Date();
    const dateString = provider.getUtcNowString();
    const date = new Date(dateString);

    expect(typeof dateString).toBe('string');
    expect(date.getUTCDate()).toEqual(utcNow.getUTCDate());
    expect(date.getUTCMonth()).toEqual(utcNow.getUTCMonth());
    expect(date.getUTCFullYear()).toEqual(utcNow.getUTCFullYear());
    expect(date.getUTCHours()).toEqual(utcNow.getUTCHours());
    expect(date.getUTCMinutes()).toEqual(utcNow.getMinutes());
    expect(date.getUTCSeconds()).toEqual(utcNow.getUTCSeconds());
  });
});
