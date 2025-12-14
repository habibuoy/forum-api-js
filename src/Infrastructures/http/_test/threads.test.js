const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const container = require('../../container');
const createServer = require('../createServer');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persist thread', async () => {
      // Arrange
      const userData = {
        id: 'id',
        username: 'test',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      const user = (await UsersTableTestHelper.findUsersById(userData.id))[0];
      const tokenManager = await container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ ...user });

      const server = await createServer(container);

      const payload = {
        title: 'Test Title',
        body: 'test body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
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
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(payload.title);
      expect(responseJson.data.addedThread.owner).toEqual(userData.id);
    });

    it('should response 400 when request payload does not contain needed property', async () => {
      // Arrange
      const userData = {
        id: 'id',
        username: 'test',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      const user = (await UsersTableTestHelper.findUsersById(userData.id))[0];
      const tokenManager = await container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ ...user });
      const server = await createServer(container);

      const payload = {
        title: 'Test Title',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload does not meet data type specification', async () => {
      // Arrange
      const userData = {
        id: 'id',
        username: 'test',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      const user = (await UsersTableTestHelper.findUsersById(userData.id))[0];
      const tokenManager = await container.getInstance(AuthenticationTokenManager.name);
      const accessToken = await tokenManager.createAccessToken({ ...user });

      const payload = {
        title: 'Test Title',
        body: 2,
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread with comments', async () => {
      // Arrange
      const userData = {
        id: 'user-123',
        username: 'test',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      const user = (await UsersTableTestHelper.findUsersById(userData.id))[0];

      const threadData = {
        id: 'thread-123',
        title: 'test',
        body: 'test',
        owner: user.id,
        date: '2021-08-08T07:18:09.775Z',
      };

      await ThreadsTableTestHelper.addThread({ ...threadData });

      const commentData = {
        id: 'comment-123',
        threadId: threadData.id,
        ownerId: userData.id,
        date: '2021-08-08T07:19:09.775Z',
      };

      const replyData = {
        id: 'reply-123',
        commentId: commentData.id,
        ownerId: userData.id,
        date: '2021-08-09T07:19:09.775Z',
      };

      const reply2Data = {
        id: 'reply-124',
        commentId: commentData.id,
        ownerId: userData.id,
        date: '2021-08-09T09:19:09.775Z',
      };

      const deleteReplyData = {
        id: 'reply-125',
        commentId: commentData.id,
        ownerId: userData.id,
        date: '2021-08-09T09:20:09.775Z',
      };

      const comment2Data = {
        id: 'comment-124',
        threadId: threadData.id,
        ownerId: userData.id,
        date: '2021-08-08T07:20:21.775Z',
      };

      const deleteComment = {
        id: 'comment-125',
        threadId: threadData.id,
        ownerId: userData.id,
        date: '2021-08-08T07:20:25.775Z',
      };

      await CommentsTableTestHelper.addComment({ ...comment2Data });
      await CommentsTableTestHelper.addComment({ ...commentData });
      await CommentsTableTestHelper.addComment({ ...deleteComment });

      await CommentsTableTestHelper.deleteCommentById(deleteComment.id);

      await RepliesTableTestHelper.addReply({ ...replyData });
      await RepliesTableTestHelper.addReply({ ...reply2Data });
      await RepliesTableTestHelper.addReply({ ...deleteReplyData });

      await RepliesTableTestHelper.deleteReplyById(deleteReplyData.id);

      await LikesTableTestHelper.addLike({ commentId: commentData.id, userId: userData.id });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadData.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadData.id);
      expect(responseJson.data.thread.title).toEqual(threadData.title);
      expect(responseJson.data.thread.body).toEqual(threadData.body);
      expect(responseJson.data.thread.date).toEqual(threadData.date);
      expect(responseJson.data.thread.username).toEqual(userData.username);
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(3);
      expect(responseJson.data.thread.comments[0].id).toEqual(commentData.id);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(3);
      expect(responseJson.data.thread.comments[0].replies[0].id).toEqual(replyData.id);
      expect(responseJson.data.thread.comments[0].replies[1].id).toEqual(reply2Data.id);
      expect(responseJson.data.thread.comments[0].replies[2].id).toEqual(deleteReplyData.id);
      expect(responseJson.data.thread.comments[0].replies[2].content).toEqual('**balasan telah dihapus**');
      expect(responseJson.data.thread.comments[1].id).toEqual(comment2Data.id);
      expect(responseJson.data.thread.comments[2].id).toEqual(deleteComment.id);
      expect(responseJson.data.thread.comments[2].content).toEqual('**komentar telah dihapus**');
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
      expect(responseJson.data.thread.comments[1].likeCount).toEqual(0);
      expect(responseJson.data.thread.comments[2].likeCount).toEqual(0);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-notfound',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
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
        content: 'Test Comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.id}/comments`,
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
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(payload.content);
      expect(responseJson.data.addedComment.owner).toEqual(userData.id);
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

      const server = await createServer(container);

      const payload = {

      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.id}/comments`,
        payload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan komentar karena properti yang dibutuhkan tidak ada');
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

      const server = await createServer(container);

      const payload = {
        content: [],
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadData.id}/comments`,
        payload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat menambahkan komentar karena tipe data tidak sesuai');
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
        content: 'Test Comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-notfound/comments',
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
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment', async () => {
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
        ownerId: userData.id,
      };

      await CommentsTableTestHelper.addComment({ ...commentData });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.id}/comments/${commentData.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
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
        ownerId: userData.id,
      };

      await CommentsTableTestHelper.addComment({ ...commentData });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-notfound/comments/${commentData.id}`,
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

    it('should response 404 when comment not found', async () => {
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
        ownerId: userData.id,
      };

      await CommentsTableTestHelper.addComment({ ...commentData });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.id}/comments/comment-notfound`,
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

    it('should response 403 when owner not correct', async () => {
      // Arrange
      const commentOwner = {
        id: 'user-124',
        username: 'test1',
        password: 'test',
      };

      const userData = {
        id: 'user-123',
        username: 'test',
        password: 'test',
      };

      await UsersTableTestHelper.addUser({ ...userData });
      const user = (await UsersTableTestHelper.findUsersById(userData.id))[0];

      await UsersTableTestHelper.addUser({ ...commentOwner });

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
        ownerId: commentOwner.id,
      };

      await CommentsTableTestHelper.addComment({ ...commentData });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadData.id}/comments/${commentData.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar beda pemilik');
    });
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
