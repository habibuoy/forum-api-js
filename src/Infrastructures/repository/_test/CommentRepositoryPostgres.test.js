const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return created comment correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });
      const thread = (await ThreadsTableTestHelper.findThreadsById(threadId))[0];

      const addComment = new AddComment({
        content: 'Test Comment',
        threadId: thread.id,
        ownerId: user.id,
      });

      const fakeIdGenerator = () => '123'; // stub!
      const repository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await repository.addComment(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return created comment correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });
      const thread = (await ThreadsTableTestHelper.findThreadsById(threadId))[0];

      const addComment = new AddComment({
        content: 'Test Comment',
        threadId: thread.id,
        ownerId: user.id,
      });

      const fakeIdGenerator = () => '123'; // stub!
      const repository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await repository.addComment(addComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: addComment.content,
        threadId: thread.id,
        ownerId: user.id,
      }));
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should verify comment owner correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });
      const thread = (await ThreadsTableTestHelper.findThreadsById(threadId))[0];

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId, threadId: thread.id, ownerId: user.id,
      });
      const comment = (await CommentsTableTestHelper.findCommentsById(commentId))[0];

      const repository = new CommentRepositoryPostgres(pool);

      await expect(repository.verifyCommentOwner({
        commentId: comment.id, ownerId: user.id,
      })).resolves.not.toThrow(NotFoundError);

      // Action and assert
      await expect(repository.verifyCommentOwner({
        commentId: comment.id, ownerId: user.id,
      })).resolves.not.toThrow(AuthorizationError);
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });
      const thread = (await ThreadsTableTestHelper.findThreadsById(threadId))[0];

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId, threadId: thread.id, ownerId: user.id,
      });

      const repository = new CommentRepositoryPostgres(pool);

      await expect(repository.verifyCommentOwner({
        commentId: 'comment-notfound', ownerId: user.id,
      })).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when owner not correct', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });
      const thread = (await ThreadsTableTestHelper.findThreadsById(threadId))[0];

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId, threadId: thread.id, ownerId: user.id,
      });
      const comment = (await CommentsTableTestHelper.findCommentsById(commentId))[0];

      const repository = new CommentRepositoryPostgres(pool);

      await expect(repository.verifyCommentOwner({
        commentId: comment.id, ownerId: 'user-notowner',
      })).rejects.toThrow(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete comment correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: user.id });
      const thread = (await ThreadsTableTestHelper.findThreadsById(threadId))[0];

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId, threadId: thread.id, ownerId: user.id,
      });
      let comment = (await CommentsTableTestHelper.findCommentsById(commentId))[0];

      const repository = new CommentRepositoryPostgres(pool);

      await expect(repository.deleteCommentById(comment.id)).resolves.not.toThrow();

      // eslint-disable-next-line prefer-destructuring
      comment = (await CommentsTableTestHelper.findCommentsById(commentId))[0];
      const isDeleted = comment.is_deleted;
      expect(isDeleted).toBe(true);
    });
  });
});
