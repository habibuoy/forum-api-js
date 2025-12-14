const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const LikeDetail = require('../../Domains/likes/entities/LikeDetail');
const LikeRepository = require('../../Domains/likes/LikeRepository');
const mapper = require('./mappers/likeMapper');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, dateProvider) {
    super();
    this._pool = pool;
    this._dateProvider = dateProvider;
  }

  async addLike(like) {
    const { commentId, userId } = like;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3) RETURNING comment_id, user_id, date',
      values: [commentId, userId, this._dateProvider.getUtcNowString()],
    };

    const result = await this._pool.query(query);

    return new LikeDetail({ ...mapper.fromDb(result.rows[0]) });
  }

  async checkLike(like) {
    const { commentId, userId } = like;

    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length || result.rows.length === 0) {
      return false;
    }

    return true;
  }

  async deleteLike(like) {
    const { commentId, userId } = like;

    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount || result.rowCount === 0) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async getLikesByCommentId(id) {
    const query = {
      text: `
        SELECT * FROM likes WHERE comment_id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows.map((r) => new LikeDetail(mapper.fromDb(r)));
  }
}

module.exports = LikeRepositoryPostgres;
