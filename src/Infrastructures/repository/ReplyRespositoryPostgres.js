const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const mapper = require('./mappers/replyMapper');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator, dateProvider) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateProvider = dateProvider;
  }

  async addReply(reply) {
    const { content, commentId, ownerId } = reply;

    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner_id, date',
      values: [id, content, commentId, ownerId, false, this._dateProvider.getUtcNowString()],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...mapper.fromDb(result.rows[0]) });
  }

  async verifyReplyOwner(reply) {
    const { replyId, ownerId } = reply;

    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length || result.rows.length === 0) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    const row = result.rows[0];
    if (row.owner_id !== ownerId) {
      throw new AuthorizationError('balasan beda pemilik');
    }
  }

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount || result.rowCount === 0) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async getReplyById(id) {
    const query = {
      text: `
        SELECT c.*, u.username FROM replies c
        JOIN users u ON c.owner_id = u.id
        WHERE c.id = $1
        ORDER BY c.date ASC
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length || result.rows.length === 0) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    return new ReplyDetail(mapper.detailFromDb(result.rows[0]));
  }

  async getRepliesByCommentId(id) {
    const query = {
      text: `
        SELECT c.*, u.username FROM replies c
        JOIN users u ON c.owner_id = u.id
        WHERE c.comment_id = $1
        ORDER BY c.date ASC
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows.map((r) => new ReplyDetail(mapper.detailFromDb(r)));
  }
}

module.exports = ReplyRepositoryPostgres;
