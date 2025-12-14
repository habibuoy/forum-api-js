const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      replyId: 'reply-123',
      ownerId: 'user-123',
    };

    const mockComment = new CommentDetail({
      id: 'comment-123',
      content: 'test comment',
      username: 'user',
      isDeleted: false,
      date: new Date().toISOString(),
    });

    /** creating dependency of use case */
    const mockRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ }));
    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const useCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockRepository,
    });

    // Action
    await useCase.execute(useCasePayload);

    expect(mockCommentRepository.getCommentById).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockRepository.verifyReplyOwner).toHaveBeenCalledWith({
      replyId: useCasePayload.replyId,
      ownerId: useCasePayload.ownerId,
    });
    expect(mockRepository.deleteReplyById).toHaveBeenCalledWith(useCasePayload.replyId);
  });
});
