class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    await this._threadRepository.getThreadById(payload.threadId);
    const { commentId, ownerId } = payload;
    await this._commentRepository.verifyCommentOwner({ commentId, ownerId });
    await this._commentRepository.deleteCommentById(payload.commentId);
  }
}

module.exports = DeleteCommentUseCase;
