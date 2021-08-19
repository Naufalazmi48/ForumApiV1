const NewThread = require('../../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  createThread(threadRepository) {
    return ({
      execute: async (payload) => {
        const newThread = new NewThread(payload);
        return threadRepository.createThread(newThread);
      },
    });
  }

  getThreadById(threadRepository) {
    return ({
      execute: async (payload) => {
        const { threadId } = payload;
        return threadRepository.getThreadById(threadId);
      },
    });
  }
}

module.exports = ThreadUseCase;
