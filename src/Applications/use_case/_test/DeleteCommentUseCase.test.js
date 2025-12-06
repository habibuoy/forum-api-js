const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      ownerId: 'user-123',
    };

    const mockThread = new CreatedThread({
      id: useCasePayload.threadId,
      title: 'Test Title',
      owner: useCasePayload.ownerId,
    });

    /** creating dependency of use case */
    const mockRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const useCase = new DeleteCommentUseCase({
      commentRepository: mockRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await useCase.execute(useCasePayload);

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockRepository.verifyCommentOwner).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      ownerId: useCasePayload.ownerId,
    });
    expect(mockRepository.deleteCommentById).toHaveBeenCalledWith(useCasePayload.commentId);
  });
});
