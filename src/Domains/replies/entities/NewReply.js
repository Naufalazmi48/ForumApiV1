class NewComment {
  constructor(payload) {
    this._verify(payload);

    this.threadId = payload.threadId;
    this.commentId = payload.commentId;
    this.content = payload.content;
    this.owner = payload.owner;
    this.date = payload.date;
  }

  _verify(payload) {
    const {
      threadId, content, owner, date, commentId,
    } = payload;
    if (!threadId || !content || !owner || !date || !commentId) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof content !== 'string' || typeof owner !== 'string' || typeof date !== 'string' || typeof commentId !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;
