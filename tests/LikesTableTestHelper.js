const LikesTableTestHelper = {
  async addLike({
    commentId = 'comment', userId = 'user',
    date = '2021-08-08T07:22:33.555Z',
  }) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [commentId, userId, date],
    };

    await pool.query(query);
  },

  async getLikesByCommentId(id) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteLike({ commentId, userId }) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
