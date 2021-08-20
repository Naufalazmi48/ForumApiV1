class DetailThread {
  constructor(payload) {

    this._verify(payload);
    
    this.id = payload.id;
    this.title = payload.title;
    this.body = payload.body;
    this.date = payload.date;
    this.username = payload.username;
    this.comments = payload.comments;
  }

  _verify(payload) {
    const {
      id, title, body, date, username, comments,
    } = payload;

    if (!id || !title || !body || !date || !username || !comments || !comments[0]) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof title !== 'string'
     || typeof body !== 'string' || typeof date !== 'string' || typeof username !== 'string'
      || !(comments instanceof Array) || !(comments[0].replies instanceof Array)) {
      throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailThread;
