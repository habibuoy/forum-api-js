class CommentDetailWithReplies {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, replies, isDeleted, likeCount,
    } = payload;

    this.id = id;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.date = date;
    this.username = username;
    this.isDeleted = isDeleted;
    this.replies = replies;
    this.likeCount = likeCount;
  }

  _verifyPayload({
    id, content, date, username, replies, isDeleted, likeCount,
  }) {
    if (!id || !content || !date || !username || !replies || isDeleted === undefined
      || likeCount === undefined
    ) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
      || typeof isDeleted !== 'boolean'
      || !(replies instanceof Array)
      || typeof likeCount !== 'number'
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetailWithReplies;
