const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const mapper = require('./mappers/commentMapper');

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
}

module.exports = CommentRepositoryPostgres;
