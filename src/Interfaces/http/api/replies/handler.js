const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyByIdHandler = this.deleteReplyByIdHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const useCase = this._container.getInstance(AddReplyUseCase.name);
    const { threadId, commentId } = request.params;

    const payload = {
      ...request.payload,
      threadId,
      commentId,
      ownerId: request.auth.credentials.id,
    };

    const addedReply = await useCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply: {
          id: addedReply.id,
          content: addedReply.content,
          owner: addedReply.ownerId,
        },
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyByIdHandler(request, h) {
    const useCase = this._container.getInstance(DeleteReplyUseCase.name);
    const { threadId, commentId, replyId } = request.params;

    const payload = {
      threadId,
      commentId,
      replyId,
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

module.exports = RepliesHandler;
