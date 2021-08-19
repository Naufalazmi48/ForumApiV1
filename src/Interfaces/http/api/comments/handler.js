const NewComment = require('../../../../Domains/comments/entities/NewComment');

class CommentHandler {
  constructor(injections) {
    const {
      addCommentUseCase, getThreadByIdUseCase, verifyOwnerCommentUseCase, deleteCommentUseCase,
    } = injections;

    this._addCommentUseCase = addCommentUseCase;
    this._getThreadByIdUseCase = getThreadByIdUseCase;
    this._verifyOwnerCommentUseCase = verifyOwnerCommentUseCase;
    this._deleteCommentUseCase = deleteCommentUseCase;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;

    const date = new Date().toISOString();
    const newComment = new NewComment({
      threadId, content, owner, date,
    });
    await this._getThreadByIdUseCase.execute({ threadId });
    const addedComment = await this._addCommentUseCase.execute(newComment);
    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const addedComment = { owner, threadId, commentId };
    await this._verifyOwnerCommentUseCase.execute(addedComment);
    await this._deleteCommentUseCase.execute(addedComment);
    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentHandler;
