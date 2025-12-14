const AddReply = require('../AddReply');

describe('an AddReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Test Reply',
      commentId: 'comment',
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrow('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'Test Reply',
      commentId: [],
      ownerId: 123,
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrow('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'Test Reply',
      commentId: 'comment',
      ownerId: 'user',
    };

    // Action
    const { content, commentId, ownerId } = new AddReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(payload.commentId);
    expect(ownerId).toEqual(payload.ownerId);
  });
});
