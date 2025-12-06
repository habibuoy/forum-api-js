const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');

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
      const fakeDateProvider = {
        getUtcNowString: () => new Date().toISOString(),
      };

      const repository = new ThreadRepositoryPostgres(pool, fakeIdGenerator, fakeDateProvider);

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
      const fakeDateProvider = {
        getUtcNowString: () => new Date('2021-08-08T07:22:33.555Z').toISOString(),
      };
      const repository = new ThreadRepositoryPostgres(pool, fakeIdGenerator, fakeDateProvider);

      // Action
      const createdThread = await repository.addThread(createThread);

      // Assert
      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-123',
        title: 'Test Title',
        body: 'test body',
        owner: user.id,
        date: new Date('2021-08-08T07:22:33.555Z').toISOString(),
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepository.getThreadById('test'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should return thread correctly', async () => {
      // Arrange
      const user = {
        id: 'user-123',
        username: 'test',
      };

      await UsersTableTestHelper.addUser({ ...user });
      const threadPayload = {
        id: 'thread-123',
        title: 'Test Title',
        body: 'test body',
        owner: user.id,
      };

      await ThreadsTableTestHelper.addThread(threadPayload);
      const repository = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await repository.getThreadById(threadPayload.id);

      // Assert
      expect(thread).toStrictEqual(new ThreadDetail({
        id: thread.id,
        title: thread.title,
        body: thread.body,
        username: user.username,
        date: thread.date,
      }));
    });
  });
});
