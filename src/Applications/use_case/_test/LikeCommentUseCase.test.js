const LikeCommentUseCase = require('../LikeCommentUseCase');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeDetail = require('../../../Domains/likes/entities/LikeDetail');

describe('LikeCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread',
      commentId: 'comment-123',
      userId: 'user',
    };

    const mockComment = new CommentDetail({
      id: 'comment-123',
      content: 'test comment',
      username: 'user',
      isDeleted: false,
      date: new Date().toISOString(),
    });

    const likeNow = (new Date()).toISOString();

    /** creating dependency of use case */
    const mockRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ }));
    mockRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve(new LikeDetail({
        commentId: mockComment.id,
        userId: useCasePayload.userId,
        date: likeNow,
      })));
    mockRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockRepository.checkLike = jest.fn()
      .mockImplementationOnce(() => Promise.resolve(false))
      .mockImplementationOnce(() => Promise.resolve(true));
    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    /** creating use case instance */
    const useCase = new LikeCommentUseCase({
      likeRepository: mockRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const firstLike = await useCase.execute(useCasePayload);
    const secondLike = await useCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.getCommentById).toHaveBeenCalledWith(useCasePayload.commentId);

    expect(mockRepository.checkLike).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });

    expect(mockRepository.addLike).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });

    expect(firstLike).toStrictEqual(new LikeDetail({
      commentId: 'comment-123',
      userId: 'user',
      date: likeNow,
    }));

    expect(mockRepository.deleteLike).toHaveBeenCalledWith({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });

    expect(secondLike).toStrictEqual(new LikeDetail({
      commentId: 'comment-123',
      userId: 'user',
      date: '',
    }));
  });
});
