const NewComment = require('../../../Domains/comments/entities/NewComment');

class CommentUseCase {
  addComment(commentRepository) {
    return ({
      execute: async (payload) => {
        const newComment = new NewComment(payload);
        return commentRepository.addComment(newComment);
      },
    });
  }

  verifyOwnerComment(commentRepository) {
    return ({
      execute: async (payload) => commentRepository.verifyOwnerComment(payload),
    });
  }

  deleteComment(commentRepository) {
    return ({
      execute: async (payload) => commentRepository.deleteComment(payload),
    });
  }

  getCommentsByThreadId(commentRepository) {
    return ({
      execute: async (threadId) => commentRepository.getCommentsByThreadId(threadId),
    });
  }
}

module.exports = CommentUseCase;
