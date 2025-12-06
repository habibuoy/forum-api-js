const ThreadDetail = require('../ThreadDetail');

describe('a ThreadDetail entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Test Title',
    };

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrow('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      body: [],
      date: { },
      username: 'username',
    };

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrow('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Test Title',
      body: 'test body',
      date: '2021-08-08T07:26:25.338Z',
      username: 'username',
    };

    // Action
    const {
      id, title, body, date, username, comments,
    } = new ThreadDetail(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
