const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadByIdUseCase = require('../../../../Applications/use_case/GetThreadByIdUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
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
}

module.exports = ThreadsHandler;
