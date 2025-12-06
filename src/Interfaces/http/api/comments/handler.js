const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentByIdHandler = this.deleteCommentByIdHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const useCase = this._container.getInstance(AddCommentUseCase.name);
    const { threadId } = request.params;

    const payload = {
      ...request.payload,
      threadId,
      ownerId: request.auth.credentials.id,
    };

    const addedComment = await useCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment: {
          id: addedComment.id,
          content: addedComment.content,
          owner: addedComment.ownerId,
        },
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentByIdHandler(request, h) {
    const useCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { threadId, commentId } = request.params;

    const payload = {
      threadId,
      commentId,
      ownerId: request.auth.credentials.id,
    };

    await useCase.execute(payload);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
