const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

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
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, false, $5) RETURNING id, content, owner',
      values: [id, threadId, content, owner, date],
    };
    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyOwnerComment({ threadId, commentId, owner }) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND is_delete = false AND thread_id = $2',
      values: [commentId, threadId],
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
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 AND owner = $2 AND thread_id = $3',
      values: [commentId, owner, threadId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, content, comments.date, comments.is_delete FROM comments 
      LEFT JOIN users ON comments.owner = users.id 
      WHERE thread_id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((comment) => {
      const detailComment = new DetailComment(
        { ...comment, replies: [], isDelete: comment.is_delete },
      );
      return { ...detailComment };
    });
  }

  async validateCommentIsAvailable(commentId) {
    const query = {
      text: `SELECT comments.content, comments.date, comments.id, users.username FROM comments
      LEFT JOIN users ON comments.owner = users.id
      WHERE comments.id = $1 AND is_delete = false`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Maaf komentar tidak tersedia');
    }
    return result.rows[0];
  }

  async postLikeOnComment({ userId, commentId }) {
    const id = `commentlikes-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO commentlikes VALUES($1, $2, $3)',
      values: [id, commentId, userId],
    };
    await this._pool.query(query);
  }

  async deleteLikeOnComment({ userId, commentId }) {
    const query = {
      text: 'DELETE FROM commentlikes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };
    await this._pool.query(query);
  }

  async verifyCommentHasBeenLiked({ userId, commentId }) {
    const query = {
      text: 'SELECT * FROM commentlikes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount) {
      return DetailComment.LIKED_COMMENT;
    }
    return DetailComment.UNLIKED_COMMENT;
  }

  async getLikesOnComment(commentId) {
    const query = {
      text: 'SELECT * FROM commentlikes WHERE comment_id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return result.rowCount;
  }
}

module.exports = CommentRepositoryPostgres;
