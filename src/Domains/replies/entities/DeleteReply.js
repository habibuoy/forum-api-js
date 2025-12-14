class DeleteReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, commentId, ownerId,
    } = payload;

    this.id = id;
    this.commentId = commentId;
    this.ownerId = ownerId;
  }

  _verifyPayload({
    id, commentId, ownerId,
  }) {
    if (!id || !commentId || !ownerId) {
      throw new Error('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof commentId !== 'string' || typeof ownerId !== 'string') {
      throw new Error('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReply;
