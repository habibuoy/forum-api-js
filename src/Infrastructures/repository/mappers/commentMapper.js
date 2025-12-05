/* eslint-disable camelcase */

const mapper = {
  fromDb: ({
    id, content, thread_id, owner_id,
  }) => ({
    id,
    content,
    threadId: thread_id,
    ownerId: owner_id,
  }),
};

module.exports = mapper;
