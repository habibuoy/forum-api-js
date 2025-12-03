const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
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
}

module.exports = ThreadsHandler;
