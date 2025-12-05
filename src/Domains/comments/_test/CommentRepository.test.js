const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoking abstract behavior', async () => {
    // Arrange
    const repository = new CommentRepository();

    // Action and Assert
    await expect(repository.addComment({})).rejects.toThrow('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
