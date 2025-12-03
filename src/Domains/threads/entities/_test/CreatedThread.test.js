const CreatedThread = require('../CreatedThread');

describe('a CreatedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Test Title',
    };

    // Action and Assert
    expect(() => new CreatedThread(payload)).toThrow('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: [],
      owner: { },
    };

    // Action and Assert
    expect(() => new CreatedThread(payload)).toThrow('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'user-123',
      title: 'Test Title',
      owner: 'test',
    };

    // Action
    const createdThread = new CreatedThread(payload);

    // Assert
    expect(createdThread.id).toEqual(payload.id);
    expect(createdThread.title).toEqual(payload.title);
    expect(createdThread.owner).toEqual(payload.owner);
  });
});
