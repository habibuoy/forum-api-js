const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const container = require('../../container');
const createServer = require('../createServer');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads/comments/likes endpoints', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and persist like', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        username: 'test',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      const user = (await UsersTableTestHelper.findUsersById(userData.id))[0];
      const tokenManager = await container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ ...user });

      const threadData = {
        id: 'thread-123',
        title: 'test',
        body: 'test',
        owner: userData.id,
      };

      await ThreadsTableTestHelper.addThread({ ...threadData });

      const commentData = {
        id: 'comment-123',
        threadId: threadData.id,
        content: 'test comment',
        ownerId: userData.id,
      };

      await CommentsTableTestHelper.addComment({ ...commentData });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadData.id}/comments/${commentData.id}/likes`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(LikesTableTestHelper.getLikesByCommentId(commentData.id)).resolves.toHaveLength(1);
    });

    it('should response 200 and delete like when already liked', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        username: 'test',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      const user = (await UsersTableTestHelper.findUsersById(userData.id))[0];
      const tokenManager = await container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ ...user });

      const threadData = {
        id: 'thread-123',
        title: 'test',
        body: 'test',
        owner: userData.id,
      };

      await ThreadsTableTestHelper.addThread({ ...threadData });

      const commentData = {
        id: 'comment-123',
        threadId: threadData.id,
        content: 'test comment',
        ownerId: userData.id,
      };

      await CommentsTableTestHelper.addComment({ ...commentData });

      await LikesTableTestHelper.addLike({ commentId: commentData.id, userId: userData.id });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadData.id}/comments/${commentData.id}/likes`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(LikesTableTestHelper.getLikesByCommentId(commentData.id)).resolves.toHaveLength(0);
    });

    it('should response 404 when thread is not valid or not found', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        username: 'test',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      const user = (await UsersTableTestHelper.findUsersById(userData.id))[0];
      const tokenManager = await container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ ...user });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-notfound/comments/comment-test/likes',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment is not valid or not found', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        username: 'test',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      const user = (await UsersTableTestHelper.findUsersById(userData.id))[0];
      const tokenManager = await container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ ...user });

      const threadData = {
        id: 'thread-123',
        title: 'test',
        body: 'test',
        owner: userData.id,
      };

      await ThreadsTableTestHelper.addThread({ ...threadData });

      const server = await createServer(container);

      const payload = {
        content: 'Test Reply',
      };

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadData.id}/comments/comment-notfound/likes`,
        payload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });
  });
});
