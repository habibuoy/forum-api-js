const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');
const LikeDetail = require('../../../Domains/likes/entities/LikeDetail');

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

    const mockComment = new CommentDetail({
      id: 'comment-123',
      content: 'Comment 1',
      username: threadOwnerUser.username,
      isDeleted: false,
      date: new Date('2021-08-08T07:26:21.338Z').toISOString(),
    });

    const mockReply = new ReplyDetail({
      id: 'reply-123',
      content: 'reply 1',
      ownerId: 'user-125',
      username: threadOwnerUser.username,
      isDeleted: false,
      date: new Date('2021-08-08T07:27:21.338Z').toISOString(),
    });

    const mockOlderReply = new ReplyDetail({
      id: 'reply-124',
      content: 'reply 2',
      ownerId: 'user-125',
      username: threadOwnerUser.username,
      isDeleted: false,
      date: new Date('2021-08-08T07:27:01.338Z').toISOString(),
    });

    const replies = [
      mockReply,
      mockOlderReply,
    ];

    const mockOlderComment = new CommentDetail({
      id: 'comment-124',
      content: 'Comment 2',
      username: threadOwnerUser.username,
      isDeleted: false,
      date: new Date('2021-08-08T07:26:15.338Z').toISOString(),
    });

    const replyForOlderComment = new ReplyDetail({
      id: 'reply-125',
      content: 'reply 1',
      username: threadOwnerUser.username,
      isDeleted: false,
      date: new Date('2021-08-08T07:26:50.338Z').toISOString(),
    });

    const replyForOlderComment2 = new ReplyDetail({
      id: 'reply-126',
      content: 'reply 2',
      username: threadOwnerUser.username,
      isDeleted: false,
      date: new Date('2021-08-08T07:26:30.338Z').toISOString(),
    });

    const repliesForOlderComment = [
      replyForOlderComment,
      replyForOlderComment2,
    ];

    const comments = [
      mockOlderComment,
      mockComment,
    ];

    const mockLike = new LikeDetail({
      commentId: mockComment.id,
      userId: threadOwnerUser.id,
      date: new Date('2021-08-08T07:28:30.338Z').toISOString(),
    });

    const likes = [
      mockLike,
    ];

    const mockThread = new ThreadDetail(threadPayload);

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementationOnce(() => Promise.resolve(repliesForOlderComment))
      .mockImplementationOnce(() => Promise.resolve(replies));
    mockLikeRepository.getLikesByCommentId = jest.fn()
      .mockImplementationOnce(() => Promise.resolve(likes))
      .mockImplementationOnce(() => Promise.resolve([]));

    /** creating use case instance */
    const useCase = new GetThreadByIdUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const threadDetailWithComments = await useCase.execute(threadPayload.id);

    // Assert
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadPayload.id);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadPayload.id);
    expect(mockReplyRepository.getRepliesByCommentId)
      .toHaveBeenNthCalledWith(1, mockOlderComment.id);
    expect(mockReplyRepository.getRepliesByCommentId)
      .toHaveBeenNthCalledWith(2, mockComment.id);
    expect(mockLikeRepository.getLikesByCommentId)
      .toHaveBeenNthCalledWith(1, mockOlderComment.id);
    expect(mockLikeRepository.getLikesByCommentId)
      .toHaveBeenNthCalledWith(2, mockComment.id);
    expect(threadDetailWithComments.id).toEqual(mockThread.id);
    expect(threadDetailWithComments.title).toEqual(mockThread.title);
    expect(threadDetailWithComments.body).toEqual(threadPayload.body);
    expect(threadDetailWithComments.date).toEqual(mockThread.date);
    expect(threadDetailWithComments.username).toEqual(threadOwnerUser.username);
    expect(threadDetailWithComments.comments).toBeDefined();
    expect(threadDetailWithComments.comments).toHaveLength(comments.length);
    expect(threadDetailWithComments.comments[0].replies).toBeDefined();
    expect(threadDetailWithComments.comments[0].replies)
      .toHaveLength(repliesForOlderComment.length);
    expect(threadDetailWithComments.comments[1].replies)
      .toHaveLength(replies.length);
    expect(threadDetailWithComments.comments[0].likeCount)
      .toEqual(likes.length);
    expect(threadDetailWithComments.comments[1].likeCount)
      .toEqual(0);
  });
});
