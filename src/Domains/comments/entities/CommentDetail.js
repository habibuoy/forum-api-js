class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, date, username, content, isDeleted,
    } = payload;

    this.id = id;
    this.date = date;
    this.username = username;
    this.isDeleted = isDeleted;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
  }

  _verifyPayload({
    id, date, username, content, isDeleted,
  }) {
    if (!id || !date || !username || !content || isDeleted === undefined) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof isDeleted !== 'boolean'
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetail;
