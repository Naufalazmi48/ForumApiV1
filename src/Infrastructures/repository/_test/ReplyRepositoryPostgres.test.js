const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
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

    describe('addReply function',  () => {
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
    });

    describe('deleteReply function',  () => {
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
    })

    describe('verifyOwnerReply function',  () => {
      it('should return NotFound Error when using invalid body', async () => {
        // Arrange 
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
        // Action and Assert
        expect(replyRepositoryPostgres.verifyOwnerReply({})).rejects.toBeInstanceOf(NotFoundError);
      })

      it('should return Authorization Error when owner is invalid', async () => {
        // Arrange 
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        await CommentTableTestHelper.addComment({});
        await ReplyTableTestHelper.addReply({});
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
        const payload = {
          replyId: 'reply-123',
          commentId: 'comment-123',
          owner: 'ngasal',
        }
        // Action and Assert
        expect(replyRepositoryPostgres.verifyOwnerReply(payload)).rejects.toBeInstanceOf(AuthorizationError);
      })

      it('should persist verify owner of reply correctly', async () => {
         // Arrange 
         await UsersTableTestHelper.addUser({});
         await ThreadsTableTestHelper.createThread({});
         await CommentTableTestHelper.addComment({});
         await ReplyTableTestHelper.addReply({});
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
         const payload = {
           replyId: 'reply-123',
           commentId: 'comment-123',
           owner: 'user-123',
         }
         // Action and Assert
        expect(replyRepositoryPostgres.verifyOwnerReply(payload)).resolves.toBeCalled;
      })
    })

    describe('getReplyByCommentId function', () => {
      it('should persist get reply correctly', async () => {
        // Arrange
        await UsersTableTestHelper.addUser({});
        await ThreadsTableTestHelper.createThread({});
        const date = new Date().toISOString();
        await CommentTableTestHelper.addComment({});
        await ReplyTableTestHelper.addReply({ date, isDelete: true });
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        // Action
        const replies = await replyRepositoryPostgres.getReplyByCommentId('comment-123');

        // Assert
        expect({...replies[0]}).toStrictEqual({
          id: 'reply-123',
          content: '**balasan telah dihapus**',
          username: 'dicoding',
          date,
        });
      });
    });

    describe('_sortReplyByAscending function', () => {
      // Arrange
      const payload = [
        {
          date: '27/09/2000',
        }, 
        {
          date: '28/09/2000',
        }
      ];

      const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {});
      // Action
      const result = replyRepositoryPostgres._sortReplyByAscending(payload)
       // Assert
      expect(result[0].date).toEqual('27/09/2000');
    })
  });
});
