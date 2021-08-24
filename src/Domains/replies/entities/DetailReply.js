class DetailReply {
  constructor(payload) {
    const payloadVerified = this._verify(payload);

    this.id = payloadVerified.id;
    this.username = payloadVerified.username;
    this.content = payloadVerified.content;
    this.date = payloadVerified.date;
  }

  static get DELETED_REPLY_CONTENT() { return '**balasan telah dihapus**'; }

  _verify(payload) {
    const {
      id, username, content, date, isDelete,
    } = payload;

    if (!id || !username || !content || !date || isDelete === undefined) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string' || typeof content !== 'string'
            || typeof date !== 'string' || typeof isDelete !== 'boolean') {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (isDelete) {
      return {
        id, username, content: DetailReply.DELETED_REPLY_CONTENT, date,
      };
    }

    return {
      id, username, content, date,
    };
  }
}

module.exports = DetailReply;
