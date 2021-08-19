/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async createThread({
    id = 'thread-123', title = 'Dicoding', body = 'Dicoding Academy', owner = 'user-123',
  }) {
    const date = new Date().toISOString();
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, title, body, owner, date],
    };

    await pool.query(query);
  },

  async getThreadById(threadId) {
    const query = {
      text: 'SELECT * from threads where id = $1',
      values: [threadId],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
