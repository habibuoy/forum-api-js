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
};

module.exports = mapper;
