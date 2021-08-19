const NewThread = require('../../../../Domains/threads/entities/NewThread');
const DetailThread = require('../../../../Domains/threads/entities/DetailThread');

class ThreadsHandler {
  constructor(injections) {
    const {
      getCommentByThreadIdUseCase,
      createThreadUseCase,
      getThreadByIdUseCase,
      getReplyByCommentIdUseCase,
    } = injections;

    this._createThreadUseCase = createThreadUseCase;
    this._getCommentByThreadIdUseCase = getCommentByThreadIdUseCase;
    this._getThreadByIdUseCase = getThreadByIdUseCase;
    this._getReplyByCommentIdUseCase = getReplyByCommentIdUseCase;

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

    const thread = await this._getThreadByIdUseCase.execute({ threadId });
    const comments = await this._getCommentByThreadIdUseCase.execute(threadId);
    const reply = await this._getReplyByCommentIdUseCase.execute(comments[0].id);

    const detailThread = new DetailThread({
      ...thread,
      comments: [{
        ...comments,
        replies: reply,
      }],
    });

    const response = h.response({
      status: 'success',
      data: {
        thread: detailThread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
