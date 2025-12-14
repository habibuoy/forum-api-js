class CommentDetailWithReplies {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, replies, isDeleted,
    } = payload;

    this.id = id;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.date = date;
    this.username = username;
    this.isDeleted = isDeleted;
    this.replies = replies;
  }

  _verifyPayload({
    id, content, date, username, replies, isDeleted,
  }) {
    if (!id || !content || !date || !username || !replies || isDeleted === undefined) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
      || typeof isDeleted !== 'boolean'
      || !(replies instanceof Array)
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetailWithReplies;
