const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const container = require('../../container');
const createServer = require('../createServer');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads endpoints', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
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
});
