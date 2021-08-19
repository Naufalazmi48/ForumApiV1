const NewReply = require('../../../Domains/replies/entities/NewReply');

class ReplyUseCase {
  addReply(replyRepository) {
    return ({
      execute: async (payload) => {
        const newReply = new NewReply(payload);
        return replyRepository.addReply(newReply);
      },
    });
  }

  deleteReply(replyRepository) {
    return ({
      execute: async (payload) => replyRepository.deleteReply(payload),
    });
  }

  verifyOwnerReply(replyRepository) {
    return ({
      execute: async (payload) => replyRepository.verifyOwnerReply(payload),
    });
  }

  getReplyByCommentId(replyRepository) {
    return ({
      execute: async (commentId) => replyRepository.getReplyByCommentId(commentId),
    });
  }
}

module.exports = ReplyUseCase;
