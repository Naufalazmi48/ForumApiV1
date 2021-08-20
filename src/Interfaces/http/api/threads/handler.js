const NewThread = require('../../../../Domains/threads/entities/NewThread');
const DetailThread = require('../../../../Domains/threads/entities/DetailThread');

class ThreadsHandler {
  constructor(injections) {
    const {
      createThreadUseCase,
      getThreadByIdUseCase,
    } = injections;

    this._createThreadUseCase = createThreadUseCase;
    this._getThreadByIdUseCase = getThreadByIdUseCase;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { title, body } = request.payload;
    const { id: owner } = request.auth.credentials;
    const date = new Date().toISOString();
    const newThread = new NewThread({
      owner, title, body, date,
    });

    const addedThread = await this._createThreadUseCase.execute(newThread);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const { threadId } = request.params;

    const thread = await this._getThreadByIdUseCase.execute(threadId);

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
