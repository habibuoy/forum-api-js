const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    await this._threadRepository.getThreadById(payload.threadId);
    await this._commentRepository.getCommentById(payload.commentId);

    return this._replyRepository.addReply(new AddReply(payload));
  }
}

module.exports = AddReplyUseCase;
