const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const mapper = require('./mappers/commentMapper');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { content, threadId, ownerId } = comment;

    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner_id',
      values: [id, content, threadId, ownerId],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...mapper.fromDb(result.rows[0]) });
  }

  async verifyCommentOwner(comment) {
    const { commentId, ownerId } = comment;

    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length || result.rows.length === 0) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    const commentRow = result.rows[0];
    if (commentRow.owner_id !== ownerId) {
      throw new AuthorizationError('komentar beda pemilik');
    }
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount || result.rowCount === 0) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
