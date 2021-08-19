class NewThread {
  constructor(payload) {
    this._verify(payload);

    this.title = payload.title;
    this.body = payload.body;
    this.owner = payload.owner;
    this.date = payload.date;
  }

  _verify(payload) {
    const {
      title, body, owner, date,
    } = payload;
    if (!title || !body || !owner || !date) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof owner !== 'string' || typeof date !== 'string') {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThread;
