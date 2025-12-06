const DeleteComment = require('../DeleteComment');

describe('a DeleteComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    // Action and Assert
    expect(() => new DeleteComment(payload)).toThrow('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: [],
      commentId: 123,
      ownerId: 'user-123',
    };

    // Action and Assert
    expect(() => new DeleteComment(payload)).toThrow('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeleteComment object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      ownerId: 'user-123',
    };

    // Action
    const { threadId, commentId, ownerId } = new DeleteComment(payload);

    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(ownerId).toEqual(payload.ownerId);
  });
});
