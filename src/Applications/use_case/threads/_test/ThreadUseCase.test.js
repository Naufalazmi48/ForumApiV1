const AddedThread = require('../../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const ThreadUseCase = require('../ThreadUseCase');
const NewThread = require('../../../../Domains/threads/entities/NewThread');
const DetailThread = require('../../../../Domains/threads/entities/DetailThread');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const CommentUseCase = require('../../comments/CommentUseCase');

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
      const thread = {
        owner: 'user-123',
        title: 'sebuah thread',
        body: 'dummy',
        date: '27092000',
      };

      const comment = {
        threadId: 'thread-123',
        owner: 'user-123',
        date: '27 09 2000',
        content: 'Kerennnn',
      };

      const expectedReply = [{
        id: 'reply-123',
        username: 'dicoding',
        date: '27 09 2000',
        content: 'Kerennnn',
      }];

      const expectedComments = [{
        id: 'comment-123',
        username: 'dicoding',
        date: '27 09 2000',
        content: 'Kerennnn',
        replies: expectedReply,
      }];

      const expectedThread = {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'dummy',
        date: '28092000',
        username: 'naufal',
        comments: [],
      };

      const expectedDetailThread = new DetailThread({
        ...expectedThread,
        comments: expectedComments,
      });

      /** Creating dependency of usecase */
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();

      /** Mocking needed function */
      mockThreadRepository.createThread = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.addComment = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.getCommentsByThreadId = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedComments));
      mockThreadRepository.getThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedThread));

      /** Creating instance  */
      const { createThread, getThreadById } = new ThreadUseCase();
      const { addComment, getCommentsByThreadId } = new CommentUseCase();
      const createThreadUseCase = createThread(mockThreadRepository);
      const getThreadUseCase = getThreadById(mockThreadRepository);
      const addCommentUseCase = addComment(mockCommentRepository);
      const getCommentUseCase = getCommentsByThreadId(mockCommentRepository);

      /** Action */
      await createThreadUseCase.execute(thread);
      await addCommentUseCase.execute(comment);
      const commentResult = await getCommentUseCase.execute(thread.id);
      const threadResult = await getThreadUseCase.execute({ threadId: thread.id });

      /** Assert */
      expect(expectedDetailThread).toEqual({
        ...threadResult,
        comments: commentResult,
      });
    });
  });
});
