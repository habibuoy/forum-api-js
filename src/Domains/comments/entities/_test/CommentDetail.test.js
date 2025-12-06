const CommentDetail = require('../CommentDetail');

describe('a CommentDetail entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrow('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      date: { },
      username: 'username',
      content: [],
      isDeleted: '123',
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrow('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      date: '2021-08-08T07:26:25.338Z',
      username: 'username',
      content: 'Test Comment',
      isDeleted: false,
    };

    // Action
    const {
      id, date, username, content, isDeleted,
    } = new CommentDetail(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(isDeleted).toEqual(false);
  });
});
