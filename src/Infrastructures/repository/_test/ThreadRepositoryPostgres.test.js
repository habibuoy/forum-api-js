const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return created thread correctly', async () => {
      // Arrange
      const userId = 'test123';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const createThread = new CreateThread({
        title: 'Test Title',
        body: 'test body',
        owner: user.id,
      });
      const fakeIdGenerator = () => '123'; // stub!
      const repository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await repository.addThread(createThread);

      // Assert
      const users = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(users).toHaveLength(1);
    });

    it('should return created thread correctly', async () => {
      // Arrange
      const userId = 'test';
      await UsersTableTestHelper.addUser({ id: userId });
      const user = (await UsersTableTestHelper.findUsersById(userId))[0];

      const createThread = new CreateThread({
        title: 'Test Title',
        body: 'test body',
        owner: user.id,
      });

      const fakeIdGenerator = () => '123'; // stub!
      const repository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await repository.addThread(createThread);

      // Assert
      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-123',
        title: 'Test Title',
        body: 'test body',
        owner: user.id,
      }));
    });
  });
});
