const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
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
});
