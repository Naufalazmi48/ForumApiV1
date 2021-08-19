const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment({
    threadId, content, owner, date,
  }) {
    const id = `comment-${this._idGenerator()}`;
    const isDelete = false;
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, threadId, content, owner, isDelete, date],
    };
    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyOwnerComment({ threadId, commentId, owner }) {
    const isDelete = false;
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND is_delete = $2 AND thread_id = $3',
      values: [commentId, isDelete, threadId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Maaf komentar tidak tersedia');
    }

    const commentOwner = result.rows[0].owner;
    if (commentOwner !== owner) {
      throw new AuthorizationError('Anda tidak berhak menghapus comment ini');
    }
  }

  async deleteComment({ threadId, commentId, owner }) {
    const isDelete = true;
    const newContent = '**komentar telah dihapus**';
    const query = {
      text: 'UPDATE comments SET is_delete = $1, content = $2 WHERE id = $3 AND owner = $4 AND thread_id = $5',
      values: [isDelete, newContent, commentId, owner, threadId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, content, comments.date FROM comments 
      LEFT JOIN users ON comments.owner = users.id 
      WHERE thread_id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Maaf komentar tidak tersedia');
    }
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
