class NewComment {
  constructor(payload) {
    this._verify(payload);

    this.threadId = payload.threadId;
    this.content = payload.content;
    this.owner = payload.owner;
    this.date = payload.date;
  }

  _verify(payload) {
    const {
      threadId, content, owner, date,
    } = payload;
    if (!threadId || !content || !owner || !date) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof content !== 'string' || typeof owner !== 'string' || typeof date !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;
