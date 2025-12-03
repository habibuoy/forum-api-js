const CreateThread = require('../../Domains/threads/entities/CreateThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    return this._threadRepository.addThread(new CreateThread(useCasePayload));
  }
}

module.exports = AddThreadUseCase;
