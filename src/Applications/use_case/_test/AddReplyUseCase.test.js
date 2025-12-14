const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Test Reply',
      commentId: 'comment',
      ownerId: 'user',
    };

    const now = new Date().toISOString();

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
    mockRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedReply({
        id: 'comment-123',
        content: 'Test Reply',
        ownerId: 'user',
        date: now,
      })));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ }));
    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    /** creating use case instance */
    const useCase = new AddReplyUseCase({
      replyRepository: mockRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await useCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'comment-123',
      content: 'Test Reply',
      ownerId: 'user',
      date: now,
    }));

    expect(mockCommentRepository.getCommentById).toHaveBeenCalledWith(useCasePayload.commentId);

    expect(mockRepository.addReply).toHaveBeenCalledWith(new AddReply({
      content: useCasePayload.content,
      commentId: useCasePayload.commentId,
      ownerId: useCasePayload.ownerId,
    }));
  });
});
