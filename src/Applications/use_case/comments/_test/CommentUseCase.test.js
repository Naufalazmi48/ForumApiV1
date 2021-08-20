const NewComment = require('../../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentUseCase = require('../CommentUseCase');

describe('CommentUseCase', () => {
  describe('Add Comment Use Case', () => {
    it('should orchestrating the add comment action correctly', async () => {
      // Arrange
      const payload = new NewComment({
        threadId: 'thread-123',
        content: 'Keren kak',
        owner: 'user-123',
        date: '27/09/2000',
      });

      const expectedAddedComment = new AddedComment({
        id: 'comment-123',
        content: payload.content,
        owner: payload.owner,
      });

      /** Creating dependency of usecase */
      const mockCommentRepository = new CommentRepository();
      const mockThreadRepository = new ThreadRepository();

      /** Mocking needed function */
      mockCommentRepository.addComment = jest.fn()
        .mockImplementation(() => Promise.resolve(expectedAddedComment));
      mockThreadRepository.getThreadById = jest.fn()
        .mockImplementation(() => Promise.resolve());

      /** Creating instance  */
      const { addComment } = new CommentUseCase();
      const addCommentUseCase = addComment({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
      });

      /** Action */
      const addedComment = await addCommentUseCase.execute(payload);

      /** Assert */
      expect(addedComment).toStrictEqual(expectedAddedComment);
      expect(mockThreadRepository.getThreadById).toBeCalledWith(payload.threadId);
      expect(mockCommentRepository.addComment).toBeCalledWith(payload);
    });
  });

  describe('Delete comment use case', () => {
    it('should orchestrating the delete comment action correctly', async () => {
      // Arrange
      const addedComment = {
        commentId: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      };

      /** Creating dependency of usecase */
      const mockCommentRepository = new CommentRepository();

      /** Mocking needed function */
      mockCommentRepository.verifyOwnerComment = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockCommentRepository.deleteComment = jest.fn()
        .mockImplementation(() => Promise.resolve());

      /** Creating instance  */
      const { deleteComment } = new CommentUseCase();
      const deleteCommentUseCase = deleteComment(mockCommentRepository);

      /** Action */
      await deleteCommentUseCase.execute(addedComment);

      /** Assert */
      expect(mockCommentRepository.verifyOwnerComment).toBeCalledWith(addedComment);
      expect(mockCommentRepository.deleteComment).toBeCalledWith(addedComment);
    });
  });
});
