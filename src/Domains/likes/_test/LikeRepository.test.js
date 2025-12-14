const LikeRepository = require('../LikeRepository');

describe('LikeRepository interface', () => {
  it('should throw error when invoking abstract behavior', async () => {
    // Arrange
    const repository = new LikeRepository();

    // Action and Assert
    await expect(repository.addLike({})).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.deleteLike({})).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.checkLike({})).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repository.getLikesByCommentId({})).rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
