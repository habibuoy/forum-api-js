const RegisterUser = require('../CreateThread');

describe('a CreateThread entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
    };

    // Action and Assert
    expect(() => new RegisterUser(payload)).toThrow('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      title: { },
      body: [],
      owner: 123,
    };

    // Action and Assert
    expect(() => new RegisterUser(payload)).toThrow('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Test title',
      body: 'test body',
      owner: 'owner',
    };

    // Action
    const { title, body, owner } = new RegisterUser(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
