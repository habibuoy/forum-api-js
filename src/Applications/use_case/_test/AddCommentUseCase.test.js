const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Test Comment',
      threadId: 'thread',
      ownerId: 'user',
    };

    const commentNow = new Date().toISOString();
    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      ownerId: useCasePayload.ownerId,
      date: commentNow,
    });

    const mockThread = new CreatedThread({
      id: useCasePayload.threadId,
      title: 'Test Title',
      owner: useCasePayload.ownerId,
      date: new Date().toISOString(),
    });

    /** creating dependency of use case */
    const mockRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'comment-123',
        content: 'Test Comment',
        ownerId: 'user',
        date: commentNow,
      })));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    /** creating use case instance */
    const useCase = new AddCommentUseCase({
      commentRepository: mockRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await useCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(mockAddedComment);

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload.threadId);

    expect(mockRepository.addComment).toHaveBeenCalledWith(new AddComment({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      ownerId: useCasePayload.ownerId,
    }));
  });
});
