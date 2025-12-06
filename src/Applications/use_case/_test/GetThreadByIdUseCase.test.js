const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');

describe('GetThreadByIdUseCase', () => {
  it('should orchestrating get thread by id action correctly', async () => {
    // Arrange
    const threadOwnerUser = {
      id: 'user-123',
      username: 'username',
    };

    const threadPayload = {
      id: 'thread-123',
      title: 'Test Title',
      body: 'test body',
      username: threadOwnerUser.username,
      date: new Date('2021-08-08T06:26:22.338Z').toISOString(),
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'Comment 1',
      ownerId: 'user-124',
      date: new Date('2021-08-08T07:26:21.338Z').toISOString(),
    });

    const mockAddedOlderComment = new AddedComment({
      id: 'comment-124',
      content: 'Comment 2',
      ownerId: 'user-124',
      date: new Date('2021-08-08T07:26:15.338Z').toISOString(),
    });

    const comments = [
      mockAddedComment,
      mockAddedOlderComment,
    ];

    const mockThread = new ThreadDetail(threadPayload);

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));

    /** creating use case instance */
    const useCase = new GetThreadByIdUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const threadDetail = await useCase.execute(threadPayload.id);

    // Assert
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadPayload.id);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadPayload.id);
    expect(threadDetail.id).toEqual(mockThread.id);
    expect(threadDetail.title).toEqual(mockThread.title);
    expect(threadDetail.body).toEqual(threadPayload.body);
    expect(threadDetail.date).toEqual(mockThread.date);
    expect(threadDetail.username).toEqual(threadOwnerUser.username);
    expect(threadDetail.comments).toBeDefined();
    expect(threadDetail.comments).toHaveLength(comments.length);
  });
});
