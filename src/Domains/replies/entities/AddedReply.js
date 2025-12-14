class AddedReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, ownerId, date,
    } = payload;

    this.id = id;
    this.content = content;
    this.ownerId = ownerId;
    this.date = date;
  }

  _verifyPayload({
    id, content, ownerId, date,
  }) {
    if (!id || !content || !ownerId || !date) {
      throw new Error('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof ownerId !== 'string' || typeof date !== 'string') {
      throw new Error('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedReply;
