const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply({
    commentId, content, owner, date,
  }) {
    const id = `reply-${this._idGenerator()}`;
    const isDelete = false;
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, commentId, content, owner, isDelete, date],
    };
    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyOwnerReply({ replyId, commentId, owner }) {
    const isDelete = false;
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND is_delete = $2 AND comment_id = $3',
      values: [replyId, isDelete, commentId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Maaf reply tidak tersedia');
    }

    const replyOwner = result.rows[0].owner;
    if (replyOwner !== owner) {
      throw new AuthorizationError('Anda tidak berhak menghapus reply ini');
    }
  }

  async deleteReply({ replyId, commentId, owner }) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 AND owner = $2 AND comment_id = $3',
      values: [replyId, owner, commentId],
    };

    await this._pool.query(query);
  }

  _sortReplyByAscending(replys) {
    return replys.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  async getReplyByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, users.username, content, replies.date FROM replies 
      LEFT JOIN users ON replies.owner = users.id 
      WHERE comment_id = $1 
      ORDER BY replies.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return this._sortReplyByAscending(result.rows);
  }
}

module.exports = ReplyRepositoryPostgres;
