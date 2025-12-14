const AddedReply = require('../AddedReply');

describe('an AddedReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'test',
      content: 'Test Reply',
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrow('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: { },
      ownerId: 'test',
      date: [],
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrow('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'test',
      content: 'Test Reply',
      ownerId: 'user',
      date: new Date().toISOString(),
    };

    // Action
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.ownerId).toEqual(payload.ownerId);
    expect(addedReply.date).toEqual(payload.date);
  });
});
