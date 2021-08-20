const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('ReplyRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {}); // dummy dependency

    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('Behavior test', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await CommentTableTestHelper.cleanTable();
      await ReplyTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addReply function', () => {
      it('should persist new Comment and return Added Comment correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        await CommentTableTestHelper.addComment({});

        const newReply = new NewReply({
          threadId: 'thread-123',
          commentId: 'comment-123',
          content: 'Karyamu keren',
          owner: 'user-123',
          date: '27/09/2000',
        });

        const fakeIdGenerator = () => '123';
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

        // Action
        const addedReply = await replyRepositoryPostgres.addReply(newReply);

        // Assert
        expect(addedReply).toStrictEqual(new AddedReply({
          id: 'reply-123',
          content: newReply.content,
          owner: newReply.owner,
        }));
      });

      it('should persist Deleted Comment action correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        await CommentTableTestHelper.addComment({});
        await ReplyTableTestHelper.addReply({});

        const addedReply = {
          commentId: 'comment-123',
          owner: 'user-123',
          replyId: 'reply-123',
        };

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        await replyRepositoryPostgres.verifyOwnerReply(addedReply);
        await replyRepositoryPostgres.deleteReply(addedReply);
        const deletedReply = await ReplyTableTestHelper.getReply(addedReply);

        // Assert
        expect(deletedReply).toHaveProperty('is_delete');
        expect(deletedReply.is_delete).toEqual(true);
      });
    });
  });
});
