const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const GetThreadByIdUseCase = require('../../../../Applications/use_case/GetThreadByIdUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const useCase = this._container.getInstance(AddThreadUseCase.name);
    const payload = {
      ...request.payload,
      owner: request.auth.credentials.id,
    };

    const createdThread = await useCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread: createdThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const useCase = this._container.getInstance(GetThreadByIdUseCase.name);
    const { threadId } = request.params;

    const thread = await useCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
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

  async deleteCommentHandler(request, h) {
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

module.exports = ThreadsHandler;
