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
        const mappedComments = comments.map((comment) => {
          if (comment.is_delete === true) {
            return {...comment, content: '**komentar telah dihapus**'}
          } else {
            return comment;
          } }
        );
        const result = [];
        for (const comment of mappedComments) {
          const replies = await replyRepository.getReplyByCommentId(comment.id);
          const repliesMapped = replies.map((reply) => {
            if (reply.is_delete === true) {
              return {...reply, content: '**balasan telah dihapus**'}
            } else {
              return reply;
            }
          })
          result.push({
            ...comment,
            replies: repliesMapped,
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
