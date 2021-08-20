const NewReply = require('../../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const ReplyUseCase = require('../ReplyUseCase');

describe('ReplyUseCase', () => {
  describe('AddReplyUseCase', () => {
    it('should orchestrating the create thread action correctly', async () => {
      /**
         * Testing orchestrating create thread usecase correctly step by step
         */
      // Arrange
      const payload = new NewReply({
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'Laskar pelangi adalah blablabla',
        owner: 'users-456',
        date: '27/09/2000',
      });

      const expectedAddedReply = new AddedReply({
        id: 'reply-123',
        content: payload.content,
        owner: payload.owner,
      });

      /** Creating dependency of usecase */
      const mockReplyRepository = new ReplyRepository();
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      /** Mocking needed function */
      mockCommentRepository.validateCommentIsAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.addReply = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedAddedReply));

      /** Creating instance  */
      const { addReply } = new ReplyUseCase();
      const addReplyUseCase = addReply({
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      /** Action */
      const addedReply = await addReplyUseCase.execute(payload);

      /** Assert */
      expect(addedReply).toStrictEqual(expectedAddedReply);
      expect(mockCommentRepository.validateCommentIsAvailable).toBeCalledWith(payload.commentId);
      expect(mockThreadRepository.getThreadById).toBeCalledWith(payload.threadId);
      expect(mockReplyRepository.addReply).toBeCalledWith(payload);
    });
  });

  describe('Delete Reply use case', () => {
    it('should orchestrating the delete comment action correctly', async () => {
      // Arrange
      const addedReply = {
        commentId: 'comment-123',
        owner: 'user-123',
        replyId: 'reply-123',
      };

      /** Creating dependency of usecase */
      const mockReplyRepository = new ReplyRepository();

      /** Mocking needed function */
      mockReplyRepository.verifyOwnerReply = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockReplyRepository.deleteReply = jest.fn()
        .mockImplementation(() => Promise.resolve());

      /** Creating instance  */
      const { deleteReply } = new ReplyUseCase();
      const deleteCommentUseCase = deleteReply(mockReplyRepository);

      /** Action */
      await deleteCommentUseCase.execute(addedReply);

      /** Assert */
      expect(mockReplyRepository.verifyOwnerReply).toBeCalledWith(addedReply);
      expect(mockReplyRepository.deleteReply).toBeCalledWith(addedReply);
    });
  });
});
