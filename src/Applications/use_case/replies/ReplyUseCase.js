const NewReply = require('../../../Domains/replies/entities/NewReply');

class ReplyUseCase {
  addReply({ replyRepository, commentRepository, threadRepository }) {
    return ({
      execute: async (payload) => {
        await threadRepository.getThreadById(payload.threadId);
        await commentRepository.validateCommentIsAvailable(payload.commentId);
        const newReply = new NewReply(payload);
        return replyRepository.addReply(newReply);
      },
    });
  }

  deleteReply(replyRepository) {
    return ({
      execute: async (payload) => {
        await replyRepository.verifyOwnerReply(payload);
        await replyRepository.deleteReply(payload);
      },
    });
  }
}

module.exports = ReplyUseCase;
