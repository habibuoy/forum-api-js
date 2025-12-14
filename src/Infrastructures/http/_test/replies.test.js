const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const container = require('../../container');
const createServer = require('../createServer');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads/comments/replies endpoints', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
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

      const payload = {
        content: 'test reply',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.id}/comments/${commentData.id}/replies`,
        payload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(payload.content);
      expect(responseJson.data.addedReply.owner).toEqual(userData.id);
    });

    it('should response 400 when request payload does not contain needed property', async () => {
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

      const payload = {

      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.id}/comments/${commentData.id}/replies`,
        payload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan balasan karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload does not meet data type specification', async () => {
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

      const payload = {
        content: [],
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.id}/comments/${commentData.id}/replies`,
        payload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan balasan karena tipe data tidak sesuai');
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

      const payload = {
        content: 'Test Reply',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-notfound/comments/comment-test/replies',
        payload,
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
        method: 'POST',
        url: `/threads/${threadData.id}/comments/comment-notfound/replies`,
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

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 200 and deleted reply', async () => {
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

      const replyData = {
        id: 'reply-123',
        commentId: commentData.id,
        ownerId: userData.id,
      };

      await RepliesTableTestHelper.addReply({ ...replyData });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.id}/comments/${commentData.id}/replies/${replyData.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when owner is not correct', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        username: 'test',
        password: 'test',
      };

      const ownerData = {
        id: 'user-124',
        username: 'test2',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      await UsersTableTestHelper.addUser({ ...ownerData });
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

      const replyData = {
        id: 'reply-123',
        commentId: commentData.id,
        ownerId: ownerData.id,
      };

      await RepliesTableTestHelper.addReply({ ...replyData });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.id}/comments/${commentData.id}/replies/${replyData.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan beda pemilik');
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
        method: 'DELETE',
        url: '/threads/thread-notfound/comments/comment-test/replies/reply-test',
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

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.id}/comments/comment-notfound/replies/reply-test`,
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

      const commentData = {
        id: 'comment-123',
        threadId: threadData.id,
        content: 'test comment',
        ownerId: userData.id,
      };

      await CommentsTableTestHelper.addComment({ ...commentData });

      const replyData = {
        id: 'reply-123',
        commentId: commentData.id,
        ownerId: userData.id,
      };

      await RepliesTableTestHelper.addReply({ ...replyData });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.id}/comments/comment-notfound/replies/reply-test`,
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
