const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  createThread(threadRepository) {
    return ({
      execute: async (payload) => {
        const newThread = new NewThread(payload);
        return threadRepository.createThread(newThread);
      },
    });
  }

  getThreadById({ threadRepository, commentRepository, replyRepository }) {
    return ({
      execute: async (threadId) => {
        const thread = await threadRepository.getThreadById(threadId);
        const comments = await commentRepository.getCommentsByThreadId(thread.id);
        const result = [];
        for (const comment of comments) {
          result.push({
            ...comment,
            replies: await replyRepository.getReplyByCommentId(comment.id),
            likeCount: await commentRepository.getLikesOnComment(comment.id),
          });
        }
        await Promise.all(result);
        const detailThread = new DetailThread({
          ...thread,
          comments: result,
        });
        return detailThread;
      },
    });
  }
}

module.exports = ThreadUseCase;
