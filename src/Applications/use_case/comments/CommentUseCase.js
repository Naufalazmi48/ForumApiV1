const NewComment = require('../../../Domains/comments/entities/NewComment');

class CommentUseCase {
  addComment({threadRepository, commentRepository}) {
    return ({
      execute: async (payload) => {
        await threadRepository.getThreadById(payload.threadId);
        const newComment = new NewComment(payload);
        return commentRepository.addComment(newComment);
      },
    });
  }

  deleteComment(commentRepository) {
    return ({
      execute: async (payload) => {
        await commentRepository.verifyOwnerComment(payload)
        await commentRepository.deleteComment(payload)
      },
    });
  }
}

module.exports = CommentUseCase;
