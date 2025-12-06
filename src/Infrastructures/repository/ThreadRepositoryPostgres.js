const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator, dateProvider) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateProvider = dateProvider;
  }

  async addThread(thread) {
    const { title, body, owner } = thread;

    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, body, owner, date',
      values: [id, title, body, owner, this._dateProvider.getUtcNowString()],
    };

    const result = await this._pool.query(query);

    return new CreatedThread({ ...result.rows[0] });
  }

  async getThreadById(id) {
    const query = {
      text: `
        SELECT t.*, u.username FROM threads t
        JOIN users u ON t.owner = u.id
        WHERE t.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length || result.rows.length === 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return new ThreadDetail({ ...result.rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;
