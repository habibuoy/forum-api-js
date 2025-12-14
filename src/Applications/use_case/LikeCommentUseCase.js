const LikeDetail = require('../../Domains/likes/entities/LikeDetail');

class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(payload) {
    const { threadId, commentId, userId } = payload;

    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.getCommentById(commentId);

    const likePayload = { commentId, userId };

    const hasLike = await this._likeRepository.checkLike(likePayload);
    let likeDetail = new LikeDetail({ ...likePayload, date: '' });

    if (hasLike) {
      await this._likeRepository.deleteLike(likePayload);
    } else {
      likeDetail = await this._likeRepository.addLike(likePayload);
    }

    return likeDetail;
  }
}

module.exports = LikeCommentUseCase;
