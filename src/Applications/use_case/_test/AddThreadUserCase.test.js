const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Test Title',
      body: 'test body',
      owner: 'owner',
    };

    const now = new Date().toISOString();
    const mockCreatedThread = new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
      date: now,
    });

    /** creating dependency of use case */
    const mockRepository = new ThreadRepository();

    /** mocking needed function */
    mockRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new CreatedThread({
        id: 'thread-123',
        title: 'Test Title',
        owner: 'owner',
        date: now,
      })));

    /** creating use case instance */
    const useCase = new AddThreadUseCase({
      threadRepository: mockRepository,
    });

    // Action
    const createdThread = await useCase.execute(useCasePayload);

    // Assert
    expect(createdThread).toStrictEqual(mockCreatedThread);

    expect(mockRepository.addThread).toHaveBeenCalledWith(new CreateThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
      date: now,
    }));
  });
});
