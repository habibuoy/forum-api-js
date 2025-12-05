const AddComment = require('../AddComment');

describe('an AddComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Test Comment',
      threadId: 'test',
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrow('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'Test Comment',
      threadId: [],
      ownerId: 123,
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrow('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Test Comment',
      threadId: 'thread',
      ownerId: 'user',
    };

    // Action
    const { content, threadId, ownerId } = new AddComment(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(payload.threadId);
    expect(ownerId).toEqual(payload.ownerId);
  });
});
