const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const useCase = this._container.getInstance(LikeCommentUseCase.name);
    const { threadId, commentId } = request.params;

    const payload = {
      threadId,
      commentId,
      userId: request.auth.credentials.id,
    };

    await useCase.execute(payload);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
