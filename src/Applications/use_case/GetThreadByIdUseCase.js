const ThreadDetailWithComments = require('../../Domains/threads/entities/ThreadDetailWithComments');

class GetThreadByIdUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const threadDetail = new ThreadDetailWithComments({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments,
    });

    return threadDetail;
  }
}

module.exports = GetThreadByIdUseCase;
