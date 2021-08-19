const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const pool = require('../../database/postgres/pool');

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
          date: '27092000',
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
        expect(deletedComment).toHaveProperty('is_delete');
        expect(deletedComment.is_delete).toEqual(true);
      });
    });

    describe('getCommentsByThreadId function', () => {
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
        const commentOnThread = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

        // Assert
        expect(commentOnThread[0]).toEqual(expectedComment);
      });
    });
  });
});
