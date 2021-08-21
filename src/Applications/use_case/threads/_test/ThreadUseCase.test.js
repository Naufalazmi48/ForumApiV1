const AddedThread = require('../../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const ThreadUseCase = require('../ThreadUseCase');
const NewThread = require('../../../../Domains/threads/entities/NewThread');
const DetailThread = require('../../../../Domains/threads/entities/DetailThread');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');

describe('ThreadUseCase', () => {
  describe('CreateThreadUseCase', () => {
    it('should orchestrating the create thread action correctly', async () => {
      /**
         * Testing orchestrating create thread usecase correctly step by step
         */
      // Arrange
      const payload = new NewThread({
        title: 'Laskar pelangi',
        body: 'Laskar pelangi adalah blablabla',
        owner: 'users-NAJXHAHUHAJAJH',
        date: '27092000',
      });

      const expectedAddedThread = new AddedThread({
        id: 'thread-XHagdjnasugus',
        title: payload.title,
        owner: payload.owner,
      });

      /** Creating dependency of usecase */
      const mockThreadRepository = new ThreadRepository();

      /** Mocking needed function */
      mockThreadRepository.createThread = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedAddedThread));

      /** Creating instance  */
      const { createThread } = new ThreadUseCase();
      const createThreadUseCase = createThread(mockThreadRepository);

      /** Action */
      const addedThread = await createThreadUseCase.execute(payload);

      /** Assert */
      expect(addedThread).toStrictEqual(expectedAddedThread);
      expect(mockThreadRepository.createThread).toBeCalledWith(new NewThread({
        title: payload.title,
        body: payload.body,
        owner: payload.owner,
        date: payload.date,
      }));
    });
  });

  describe('GetDetailThreadUseCase', () => {
    it('should orchestrating the get detail thread action correctly', async () => {
      /**
         * Testing orchestrating create thread usecase correctly step by step
         */
      // Arrange

      const expectedReply = [{
        id: 'reply-123',
        username: 'dicoding',
        date: '27 09 2000',
        content: 'Kerennnn',
        is_delete: true,
      }];

      const expectedComments = [{
        id: 'comment-123',
        username: 'dicoding',
        date: '27 09 2000',
        content: 'Kerennnn',
        replies: expectedReply,
      },
      {
        id: 'comment-456',
        username: 'naufal',
        date: '27 09 2000',
        content: 'mantap',
        is_delete: true,
        replies: expectedReply,
      },
      ];

      const expectedThread = {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'dummy',
        date: '28092000',
        username: 'naufal',
        comments: expectedComments,
      };

      const expectedDetailThread = new DetailThread({
        ...expectedThread,
        comments: expectedComments,
      });

      /** Creating dependency of usecase */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      /** Mocking needed function */
      mockThreadRepository.getThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedThread));
      mockCommentRepository.getCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedComments.map((comment) => {
          if (comment.is_delete === true) {
            return {...comment, content: '**komentar telah dihapus**'}
          } else {
            return comment;
          } }
        )));
      mockReplyRepository.getReplyByCommentId = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedReply.map((reply) => {
          if (reply.is_delete === true) {
            return {...reply, content: '**balasan telah dihapus**'}
          } else {
            return reply;
          }
        })));

      /** Creating instance  */
      const { getThreadById } = new ThreadUseCase();
      const getThreadUseCase = getThreadById({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      /** Action */
      const threadResult = await getThreadUseCase.execute(expectedThread.id);

      /** Assert */
      expect(threadResult.id).toEqual('thread-123');
      expect(threadResult.comments[1].content).toEqual('**komentar telah dihapus**');
      expect(threadResult.comments[1].replies[0].content).toEqual('**balasan telah dihapus**');
    });
  });
});
