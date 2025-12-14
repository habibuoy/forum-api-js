const CommentDetailWithReplies = require('../../Domains/comments/entities/CommentDetailWithReplies');
const ThreadDetailWithComments = require('../../Domains/threads/entities/ThreadDetailWithComments');

class GetThreadByIdUseCase {
  constructor({
    commentRepository, threadRepository, replyRepository, likeRepository,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentWithReplies = await Promise.all(
      comments.map(async (c) => {
        const likes = await this._likeRepository.getLikesByCommentId(c.id);
        return new CommentDetailWithReplies({
          id: c.id,
          content: c.content,
          username: c.username,
          date: c.date,
          isDeleted: c.isDeleted,
          replies: await this._replyRepository.getRepliesByCommentId(c.id),
          likeCount: likes.length,
        });
      }),
    );

    const threadDetail = new ThreadDetailWithComments({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: commentWithReplies,
    });

    return threadDetail;
  }
}

module.exports = GetThreadByIdUseCase;
