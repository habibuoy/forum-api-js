const DeleteReply = require('../DeleteReply');

describe('a DeleteReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
    };

    // Action and Assert
    expect(() => new DeleteReply(payload)).toThrow('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: [],
      commentId: { },
      ownerId: 'user-123',
    };

    // Action and Assert
    expect(() => new DeleteReply(payload)).toThrow('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeleteReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      ownerId: 'user-123',
    };

    // Action
    const { id, commentId, ownerId } = new DeleteReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(commentId).toEqual(payload.commentId);
    expect(ownerId).toEqual(payload.ownerId);
  });
});
