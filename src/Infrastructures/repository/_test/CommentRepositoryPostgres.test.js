const { nanoid } = require('nanoid');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {}); // dummy dependency

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
  });

  describe('Behavior test', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await CommentTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addComment function', () => {
      it('should persist new Comment and return Added Comment correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});

        const newComment = new NewComment({
          threadId: 'thread-123',
          content: 'Karyamu keren',
          owner: 'user-123',
          date: '27/09/2000',
        });

        const fakeIdGenerator = () => '123';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedComment = await commentRepositoryPostgres.addComment(newComment);

        // Assert
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: newComment.content,
          owner: newComment.owner,
        }));
      });
    });

    describe('deleteComment function', () => {
      it('should persist Deleted Comment action correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        await CommentTableTestHelper.addComment({});

        const addedComment = {
          commentId: 'comment-123',
          owner: 'user-123',
          threadId: 'thread-123',
        };

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        await commentRepositoryPostgres.verifyOwnerComment(addedComment);
        await commentRepositoryPostgres.deleteComment(addedComment);
        const deletedComment = await CommentTableTestHelper.getComment(addedComment);

        // Assert
        expect(deletedComment).toHaveProperty('isDelete');
        expect(deletedComment.isDelete).toEqual(true);
      });
    });

    describe('getCommentsByThreadId function', () => {
      it('should persist get comments correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        const date = new Date().toISOString();
        await CommentTableTestHelper.addComment({ date, isDelete: true });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        const commentOnThread = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

        // Assert
        expect({ ...commentOnThread[0] }).toStrictEqual({
          id: 'comment-123',
          content: DetailComment.DELETED_COMMENT_CONTENT,
          username: 'dicoding',
          date,
          replies: [],
        });
      });
    });

    describe('validateCommentIsAvailable function', () => {
      it('should return Not Found Error when comment is not available', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        // Action and Assert
        expect(commentRepositoryPostgres.verifyOwnerComment(0))
          .rejects.toBeInstanceOf(NotFoundError);
      });
      it('should persist get comments correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        const date = new Date().toISOString();
        await CommentTableTestHelper.addComment({ date });

        const expectedComment = {
          id: 'comment-123',
          content: 'Keren bang',
          username: 'dicoding',
          date,
        };

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        // Action
        const commentOnThread = await commentRepositoryPostgres.validateCommentIsAvailable('comment-123');

        // Assert
        expect(commentOnThread).toEqual(expectedComment);
      });
    });

    describe('verifyOwnerComment function', () => {
      it('should return NotFound Error when using invalid body', async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        // Action and Assert
        expect(commentRepositoryPostgres.verifyOwnerComment({}))
          .rejects.toBeInstanceOf(NotFoundError);
      });

      it('should return Authorization Error when owner is invalid', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        await CommentTableTestHelper.addComment({});
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        const payload = {
          threadId: 'thread-123',
          commentId: 'comment-123',
          owner: 'ngasal',
        };
        // Action and Assert
        expect(commentRepositoryPostgres.verifyOwnerComment(payload))
          .rejects.toBeInstanceOf(AuthorizationError);
      });

      it('should persist verify owner of comment correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        await CommentTableTestHelper.addComment({});
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        const spyVerifyOwnerComment = jest.spyOn(commentRepositoryPostgres, 'verifyOwnerComment');
        const payload = {
          threadId: 'thread-123',
          commentId: 'comment-123',
          owner: 'user-123',
        };
        // Action
        await commentRepositoryPostgres.verifyOwnerComment(payload);
        // Assert
        expect(spyVerifyOwnerComment).toBeCalledWith(payload);
        expect(spyVerifyOwnerComment).toBeCalledTimes(1);
      });
    });

    describe('Update Comment Like Function', () => {
      it('should persist update comment when comment has been liked correctly', async () => {
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        await CommentTableTestHelper.addComment({});
        await CommentTableTestHelper.postLikeOnComment({}, {});
        const payload = {
          userId: 'user-123',
          commentId: 'comment-123',
        };
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, nanoid);
        const spyVerifyCommentHasBeenLiked = jest.spyOn(commentRepositoryPostgres, 'verifyCommentHasBeenLiked');
        const spyDeleteLikeOnComment = jest.spyOn(commentRepositoryPostgres, 'deleteLikeOnComment');
        // Action
        await commentRepositoryPostgres.verifyCommentHasBeenLiked(payload);
        await commentRepositoryPostgres.deleteLikeOnComment(payload);
        // Assert
        expect(spyVerifyCommentHasBeenLiked).toBeCalledWith(payload);
        expect(spyDeleteLikeOnComment).toBeCalledWith(payload);
      });

      it('should persist update comment when comment not liked correctly', async () => {
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        await CommentTableTestHelper.addComment({});
        const payload = {
          userId: 'user-123',
          commentId: 'comment-123',
        };
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, nanoid);
        const spyVerifyCommentHasBeenLiked = jest.spyOn(commentRepositoryPostgres, 'verifyCommentHasBeenLiked');
        const spyPostLikeOnComment = jest.spyOn(commentRepositoryPostgres, 'postLikeOnComment');
        // Action
        await commentRepositoryPostgres.verifyCommentHasBeenLiked(payload);
        await commentRepositoryPostgres.postLikeOnComment(payload);
        // Assert
        expect(spyVerifyCommentHasBeenLiked).toBeCalledWith(payload);
        expect(spyPostLikeOnComment).toBeCalledWith(payload);
      });
    });

    describe('Get likes on comment count Function', () => {
      it('should persist get likes on comment correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        await CommentTableTestHelper.addComment({});
        await CommentTableTestHelper.postLikeOnComment({}, {});

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        // Action
        const likeCount = await commentRepositoryPostgres.getLikesOnComment('comment-123');
        // Assert
        expect(likeCount).toEqual(1);
      });
    });
  });
});
