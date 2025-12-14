class LikeDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId, userId, date } = payload;

    this.commentId = commentId;
    this.userId = userId;
    this.date = date;
  }

  _verifyPayload({ commentId, userId, date }) {
    if (!commentId || !userId || date === undefined) {
      throw new Error('LIKE_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string' || typeof userId !== 'string' || typeof date !== 'string') {
      throw new Error('LIKE_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LikeDetail;
