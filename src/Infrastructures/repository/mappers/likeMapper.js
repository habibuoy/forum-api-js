/* eslint-disable camelcase */

const mapper = {
  fromDb: ({
    comment_id, user_id, date,
  }) => ({
    commentId: comment_id,
    userId: user_id,
    date,
  }),
};

module.exports = mapper;
