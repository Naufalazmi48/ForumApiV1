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
        const commentsOnThread = await commentRepository.getCommentsByThreadId(thread.id);
        const result = [];
        for (const comment of commentsOnThread) {
          result.push({
            ...comment,
            replies: await replyRepository.getReplyByCommentId(comment.id),
          });
        }
        await Promise.all(result);
        return new DetailThread({
          ...thread,
          comments: result,
        });
      },
    });
  }
}

module.exports = ThreadUseCase;
