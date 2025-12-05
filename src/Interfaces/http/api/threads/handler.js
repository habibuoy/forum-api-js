const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
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
}

module.exports = ThreadsHandler;
