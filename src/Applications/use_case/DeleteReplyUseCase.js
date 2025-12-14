class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }

  async execute(payload) {
    await this._threadRepository.getThreadById(payload.threadId);
    await this._commentRepository.getCommentById(payload.commentId);
    const { replyId, ownerId } = payload;
    await this._replyRepository.verifyReplyOwner({ replyId, ownerId });
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
