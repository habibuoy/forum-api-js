/* eslint-disable camelcase */

const mapper = {
  fromDb: ({
    id, content, owner_id, date,
  }) => ({
    id,
    content,
    ownerId: owner_id,
    date,
  }),
  detailFromDb: ({
    id, content, comment_id, owner_id, date, is_deleted, username,
  }) => ({
    id,
    content,
    commentId: comment_id,
    ownerId: owner_id,
    date,
    isDeleted: is_deleted,
    username,
  }),
};

module.exports = mapper;
