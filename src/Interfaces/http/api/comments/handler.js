const NewComment = require('../../../../Domains/comments/entities/NewComment');

class CommentHandler {
  constructor({
    addCommentUseCase, deleteCommentUseCase, updateCommentLikesUseCase,
  }) {
    this._addCommentUseCase = addCommentUseCase;
    this._deleteCommentUseCase = deleteCommentUseCase;
    this._updateCommentLikesUseCase = updateCommentLikesUseCase;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;

    const date = new Date().toISOString();
    const newComment = new NewComment({
      threadId, content, owner, date,
    });
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

  async putCommentLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await this._updateCommentLikesUseCase.execute({ userId, threadId, commentId });
    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const addedComment = { owner, threadId, commentId };
    await this._deleteCommentUseCase.execute(addedComment);
    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentHandler;
