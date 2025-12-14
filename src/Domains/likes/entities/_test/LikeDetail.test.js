const LikeDetail = require('../LikeDetail');

describe('a LikeDetail entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment',
    };

    // Action and Assert
    expect(() => new LikeDetail(payload)).toThrow('LIKE_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 12,
      userId: [],
      date: { },
    };

    // Action and Assert
    expect(() => new LikeDetail(payload)).toThrow('LIKE_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create LikeDetail object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment',
      userId: 'user',
      date: (new Date()).toISOString(),
    };

    // Action
    const {
      commentId, userId, date,
    } = new LikeDetail(payload);

    // Assert
    expect(commentId).toEqual(payload.commentId);
    expect(userId).toEqual(payload.userId);
    expect(userId).toEqual(payload.userId);
    expect(date).toEqual(payload.date);
  });
});
