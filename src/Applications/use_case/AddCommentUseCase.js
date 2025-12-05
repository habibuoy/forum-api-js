const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    await this._threadRepository.getThreadById(payload.threadId);

    return this._commentRepository.addComment(new AddComment(payload));
  }
}

module.exports = AddCommentUseCase;
