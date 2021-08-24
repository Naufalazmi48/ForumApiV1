class DetailComment {
  constructor(payload) {
    const payloadVerified = this._verify(payload);

    this.id = payloadVerified.id;
    this.username = payloadVerified.username;
    this.content = payloadVerified.content;
    this.date = payloadVerified.date;
    this.replies = payloadVerified.replies;
  }

  static get DELETED_COMMENT_CONTENT() { return '**komentar telah dihapus**'; }

  static get LIKED_COMMENT() { return 1; }

  static get UNLIKED_COMMENT() { return -1; }

  _verify(payload) {
    if (this._isPayloadNotContainNeededProperty(payload)) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (this._isPayloadNotMeetDataTypeSpecification(payload)) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (payload.isDelete) {
      return {
        ...payload, content: DetailComment.DELETED_COMMENT_CONTENT,
      };
    }
    return payload;
  }

  _isPayloadNotContainNeededProperty({
    id, username, content, date, isDelete, replies,
  }) {
    return (!id || !username || !content || !date || isDelete === undefined || !replies);
  }

  _isPayloadNotMeetDataTypeSpecification({
    id, username, content, date, isDelete, replies,
  }) {
    return (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof isDelete !== 'boolean'
      || !(replies instanceof Array)
    );
  }
}

module.exports = DetailComment;
