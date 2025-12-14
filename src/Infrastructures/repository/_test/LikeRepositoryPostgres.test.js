const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const LikeDetail = require('../../../Domains/likes/entities/LikeDetail');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, ownerId: user.id });
      const comment = (await CommentsTableTestHelper.findCommentsById(commentId))[0];

      const addLike = {
        commentId: comment.id,
        userId: user.id,
      };

      const fakeIdGenerator = () => '123'; // stub!
      const fakeDateProvider = {
        getUtcNowString: () => new Date('2021-08-08T07:22:33.555Z').toISOString(),
      };
      const repository = new LikeRepositoryPostgres(pool, fakeIdGenerator, fakeDateProvider);

      // Action
      const addedLike = await repository.addReply(addLike);

      // Assert
      expect(addedLike).toStrictEqual(new LikeDetail({
        commentId: comment.id,
        userId: user.id,
        date: fakeDateProvider.getUtcNowString(),
      }));
    });
  });

  describe('checkLike function', () => {
    it('should check like correctly', async () => {
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

      await LikesTableTestHelper.addLike({ commentId, userId });

      const repository = new LikeRepositoryPostgres(pool);

      // Action and assert
      await expect(repository.checkLike({
        commentId, userId,
      })).resolves.not.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when like not found', async () => {
      // Arrange
      const repository = new LikeRepositoryPostgres(pool);

      // Action and Assert
      await expect(repository.verifyReplyOwner({
        commentId: 'like', userId: 'user',
      })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like correctly', async () => {
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

      await LikesTableTestHelper.addLike({ commentId, userId });

      const repository = new LikeRepositoryPostgres(pool);

      // Action and Assert
      await expect(repository.deleteLike({ commentId, userId })).resolves.not.toThrow();
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const repository = new LikeRepositoryPostgres(pool);

      // Action and Assert
      await expect(repository.deleteLike({ commentId: 'comment', userId: 'user' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('getLikesByCommentId function', () => {
    it('should get likes by comment id correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const userId2 = 'user-124';
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

      await LikesTableTestHelper.addLike({ commentId, userId });
      await LikesTableTestHelper.addLike({ commentId, userId: userId2 });

      const repository = new LikeRepositoryPostgres(pool);

      // Action
      const likes = await repository.getLikesByCommentId(commentId);

      expect(likes).toHaveLength(2);
      expect(likes[0].userId).toEqual(userId);
      expect(likes[0].userId).toEqual(userId2);
    });
  });
});
