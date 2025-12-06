/* eslint-disable camelcase */

const mapper = {
  fromDb: ({
    id, content, thread_id, owner_id, date,
  }) => ({
    id,
    content,
    threadId: thread_id,
    ownerId: owner_id,
    date,
  }),
  detailFromDb: ({
    id, content, thread_id, owner_id, date, is_deleted, username,
  }) => ({
    id,
    content,
    threadId: thread_id,
    ownerId: owner_id,
    date,
    isDeleted: is_deleted,
    username,
  }),
};

module.exports = mapper;
