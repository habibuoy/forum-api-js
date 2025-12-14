const CommentDetailWithReplies = require('../CommentDetailWithReplies');

describe('a CommentDetailWithReplies entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      content: '',
    };

    // Action and Assert
    expect(() => new CommentDetailWithReplies(payload)).toThrow('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'test comment',
      date: { },
      username: 'username',
      isDeleted: 123,
      replies: { },
      likeCount: '',
    };

    // Action and Assert
    expect(() => new CommentDetailWithReplies(payload)).toThrow('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetailWithReplies object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'test comment',
      date: '2021-08-08T07:26:25.338Z',
      username: 'username',
      isDeleted: false,
      replies: [],
      likeCount: 1,
    };

    // Action
    const {
      id, content, date, username, replies, isDeleted, likeCount,
    } = new CommentDetailWithReplies(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(isDeleted).toEqual(payload.isDeleted);
    expect(replies).toBeInstanceOf(Array);
    expect(replies.length).toEqual(payload.replies.length);
    expect(likeCount).toEqual(payload.likeCount);
  });
});
