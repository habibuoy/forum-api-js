const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRespositoryPostgres');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, ownerId: user.id });
      const comment = (await CommentsTableTestHelper.findCommentsById(commentId))[0];

      const addReply = new AddReply({
        content: 'Test Reply',
        commentId: comment.id,
        ownerId: user.id,
      });

      const fakeIdGenerator = () => '123'; // stub!
      const fakeDateProvider = {
        getUtcNowString: () => new Date('2021-08-08T07:22:33.555Z').toISOString(),
      };
      const repository = new ReplyRepositoryPostgres(pool, fakeIdGenerator, fakeDateProvider);

      // Action
      const addedReply = await repository.addReply(addReply);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: addReply.content,
        ownerId: user.id,
        date: fakeDateProvider.getUtcNowString(),
      }));
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should verify reply owner correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        ownerId: user.id,
      });

      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        ownerId: user.id,
      });

      const repository = new ReplyRepositoryPostgres(pool);

      // Action and assert
      await expect(repository.verifyReplyOwner({
        replyId, ownerId: user.id,
      })).resolves.not.toThrow(NotFoundError);

      await expect(repository.verifyReplyOwner({
        replyId, ownerId: user.id,
      })).resolves.not.toThrow(AuthorizationError);
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const repository = new ReplyRepositoryPostgres(pool);

      // Action and Assert
      await expect(repository.verifyReplyOwner({
        replyId: 'reply-notfound', ownerId: 'user',
      })).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when owner not correct', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        ownerId: user.id,
      });

      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        ownerId: user.id,
      });

      const repository = new ReplyRepositoryPostgres(pool);

      // Action and Assert
      await expect(repository.verifyReplyOwner({
        replyId, ownerId: 'user-notowner',
      })).rejects.toThrow(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should delete reply correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        ownerId: user.id,
      });

      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        ownerId: user.id,
      });

      const repository = new ReplyRepositoryPostgres(pool);

      // Action and Assert
      await expect(repository.deleteReplyById(replyId)).resolves.not.toThrow();
      // eslint-disable-next-line prefer-destructuring
      const reply = await RepliesTableTestHelper.findReplyById(replyId);

      const isDeleted = reply.is_deleted;
      expect(isDeleted).toEqual(true);
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const repository = new ReplyRepositoryPostgres(pool);

      // Action and Assert
      await expect(repository.deleteReplyById('reply-notfound')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getReplyById function', () => {
    it('should get reply by id correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        ownerId: user.id,
      });

      const now = (new Date()).toISOString();
      const replyPayload = {
        id: 'reply-123',
        commentId,
        content: 'test reply',
        ownerId: user.id,
        date: now,
      };

      await RepliesTableTestHelper.addReply(replyPayload);

      const repository = new ReplyRepositoryPostgres(pool);

      // Action
      const reply = await repository.getReplyById(replyPayload.id);

      expect(reply).toStrictEqual(new ReplyDetail({
        id: replyPayload.id,
        content: replyPayload.content,
        username: user.username,
        date: replyPayload.date,
        isDeleted: false,
      }));
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should get replies by comment id correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        ownerId: user.id,
      });

      const replyId = 'reply-123';
      const reply2Id = 'reply-124';

      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId,
        content: 'test reply',
        ownerId: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: reply2Id,
        commentId,
        content: 'test reply 2',
        ownerId: userId,
        date: '2021-08-08T07:24:33.555Z',
      });

      const repository = new ReplyRepositoryPostgres(pool);

      const replies = await repository.getRepliesByCommentId(commentId);

      expect(replies).toHaveLength(2);
      expect(replies[0].id).toEqual(replyId);
      expect(replies[1].id).toEqual(reply2Id);
    });
  });
});
