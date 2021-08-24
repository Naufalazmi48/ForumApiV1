const AddedThread = require('../../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const ThreadUseCase = require('../ThreadUseCase');
const NewThread = require('../../../../Domains/threads/entities/NewThread');
const DetailThread = require('../../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../../Domains/replies/entities/DetailReply');
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

  describe('GetThreadByIdUseCase', () => {
    it('should orchestrating the get detail thread action correctly', async () => {
      /**
         * Testing orchestrating create thread usecase correctly step by step
         */
      // Arrange
      const expectedLikeCount = 20;

      const expectedReply = [{
        id: 'reply-123',
        username: 'dicoding',
        date: '27 09 2000',
        content: DetailReply.DELETED_REPLY_CONTENT,
        isDelete: true,
      }];

      const expectedComments = [{
        id: 'comment-123',
        username: 'dicoding',
        date: '27 09 2000',
        content: DetailComment.DELETED_COMMENT_CONTENT,
        isDelete: true,
        replies: [{ ...expectedReply[0] }],
        likeCount: expectedLikeCount,
      },
      ];

      const expectedThread = new DetailThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'dummy',
        date: '28092000',
        username: 'naufal',
        comments: [{ ...expectedComments[0] }],
      });

      /** Creating dependency of usecase */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      /** Mocking needed function */
      mockThreadRepository.getThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedThread));
      mockCommentRepository.getCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve([{ ...expectedComments[0] }]));
      mockReplyRepository.getReplyByCommentId = jest.fn()
        .mockImplementation(() => Promise.resolve([{ ...expectedReply[0] }]));
      mockCommentRepository.getLikesOnComment = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedLikeCount));

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
      expect(threadResult).toStrictEqual(expectedThread);
    });
  });
});
