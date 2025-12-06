const ThreadDetailWithComments = require('../ThreadDetailWithComments');

describe('a ThreadDetailWithComments entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Test Title',
    };

    // Action and Assert
    expect(() => new ThreadDetailWithComments(payload)).toThrow('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      body: [],
      date: { },
      username: 'username',
      comments: { },
    };

    // Action and Assert
    expect(() => new ThreadDetailWithComments(payload)).toThrow('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetailWithComments object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Test Title',
      body: 'test body',
      date: '2021-08-08T07:26:25.338Z',
      username: 'username',
      comments: [],
    };

    // Action
    const {
      id, title, body, date, username, comments,
    } = new ThreadDetailWithComments(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toBeInstanceOf(Array);
    expect(comments.length).toEqual(payload.comments.length);
  });
});
