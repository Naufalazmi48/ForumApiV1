/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
  async addComment({
    id = 'comment-123', threadId = 'thread-123', content = 'Keren bang', owner = 'user-123', isDelete = false,
    date = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, owner, isDelete, date],
    };

    await pool.query(query);
  },

  async getComment({
    owner = 'user-123', commentId = 'comment-123',
  }) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  async getCommentsByThreadId({
    owner = 'user-123', threadId = 'thread-123',
  }) {
    const query = {
      text: 'SELECT * FROM comments WHERE thread_id = $1 AND owner = $2',
      values: [threadId, owner],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentTableTestHelper;
