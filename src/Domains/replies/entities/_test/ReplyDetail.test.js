const ReplyDetail = require('../ReplyDetail');

describe('a ReplyDetail entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
    };

    // Action and Assert
    expect(() => new ReplyDetail(payload)).toThrow('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      date: { },
      username: 'username',
      content: [],
      isDeleted: '123',
    };

    // Action and Assert
    expect(() => new ReplyDetail(payload)).toThrow('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      date: '2021-08-08T07:26:25.338Z',
      username: 'username',
      content: 'Test Comment',
      isDeleted: false,
    };

    // Action
    const {
      id, date, username, content, isDeleted,
    } = new ReplyDetail(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(isDeleted).toEqual(false);
  });

  it('should create ReplyDetail object correctly with deleted status', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      date: '2021-08-08T07:26:25.338Z',
      username: 'username',
      content: 'Test Comment',
      isDeleted: true,
    };

    // Action
    const {
      id, date, username, content, isDeleted,
    } = new ReplyDetail(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(content).toEqual('**balasan telah dihapus**');
    expect(isDeleted).toEqual(true);
  });
});
