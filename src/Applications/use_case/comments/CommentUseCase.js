const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');

class CommentUseCase {
  addComment({ threadRepository, commentRepository }) {
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
        await commentRepository.verifyOwnerComment(payload);
        await commentRepository.deleteComment(payload);
      },
    });
  }

  updateCommentLikes({ threadRepository, commentRepository }) {
    return ({
      execute: async (payload) => {
        await threadRepository.getThreadById(payload.threadId);
        await commentRepository.validateCommentIsAvailable(payload.commentId);
        const result = await commentRepository.verifyCommentHasBeenLiked(payload);
        if (result === DetailComment.UNLIKED_COMMENT) {
          await commentRepository.postLikeOnComment(payload);
        } else {
          await commentRepository.deleteLikeOnComment(payload);
        }
      },
    });
  }
}

module.exports = CommentUseCase;
