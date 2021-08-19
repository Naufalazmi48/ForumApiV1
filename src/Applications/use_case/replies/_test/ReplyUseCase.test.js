const NewReply = require('../../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
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
        date: '27092000',
      });

      const expectedAddedReply = new AddedReply({
        id: 'reply-123',
        content: payload.content,
        owner: payload.owner,
      });

      /** Creating dependency of usecase */
      const mockReplyRepository = new ReplyRepository();

      /** Mocking needed function */
      mockReplyRepository.addReply = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedAddedReply));

      /** Creating instance  */
      const { addReply } = new ReplyUseCase();
      const addReplyUseCase = addReply(mockReplyRepository);

      /** Action */
      const addedReply = await addReplyUseCase.execute(payload);

      /** Assert */
      expect(addedReply).toStrictEqual(expectedAddedReply);
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
      const { verifyOwnerReply, deleteReply } = new ReplyUseCase();
      const verifyUseCase = verifyOwnerReply(mockReplyRepository);
      const deleteCommentUseCase = deleteReply(mockReplyRepository);

      /** Action */
      await verifyUseCase.execute(addedReply);
      await deleteCommentUseCase.execute(addedReply);

      /** Assert */
      expect(mockReplyRepository.verifyOwnerReply).toBeCalledWith(addedReply);
      expect(mockReplyRepository.deleteReply).toBeCalledWith(addedReply);
    });
  });

  describe('Get replys By Comment Id Use Case', () => {
    it('should orchestrating the get comment action correctly', async () => {
      // Arrange
      const expectedReply = [{
        id: 'comment-123',
        username: 'dicoding',
        date: '27 09 2000',
        content: 'Kerennnn',
      }];

      /** Creating dependency of usecase */
      const mockReplyRepository = new ReplyRepository();

      /** Mocking needed function */
      mockReplyRepository.getReplyByCommentId = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedReply));

      /** Creating instance  */
      const { getReplyByCommentId } = new ReplyUseCase();
      const getReplyUseCase = getReplyByCommentId(mockReplyRepository);

      /** Action */
      const replys = await getReplyUseCase.execute('comment-123');

      /** Assert */
      expect(replys).toStrictEqual(replys);
    });
  });
});
