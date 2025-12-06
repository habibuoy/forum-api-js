class CreatedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, title, owner, date,
    } = payload;

    this.id = id;
    this.title = title;
    this.owner = owner;
    this.date = date;
  }

  _verifyPayload({
    id, title, owner, date,
  }) {
    if (!id || !title || !owner || !date) {
      throw new Error('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof title !== 'string'
      || typeof owner !== 'string'
      || typeof date !== 'string') {
      throw new Error('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CreatedThread;
