const NewReply = require('../../../../Domains/replies/entities/NewReply');

class ReplyHandler {
  constructor({ addReplyUseCase, deleteReplyUseCase }) {

    this._addReplyUseCase = addReplyUseCase;
    this._deleteReplyUseCase = deleteReplyUseCase;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;

    const date = new Date().toISOString();
    const newComment = new NewReply({
      threadId, content, owner, date, commentId,
    });
    const addedReply = await this._addReplyUseCase.execute(newComment);
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { commentId, replyId } = request.params;

    const addedReply = { owner, replyId, commentId };
    await this._deleteReplyUseCase.execute(addedReply);
    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ReplyHandler;
