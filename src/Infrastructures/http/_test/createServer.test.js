const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const Injection = require('../../injections');
const pool = require('../../database/postgres/pool');

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  // ======================================== Thread Use Case

  describe('threads fiture testing', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
    });

    it('should response 400 when request post thread with invalid body request', async () => {
      // Arrange
      const requestPayload = {
        title: 'title',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads',
        method: 'POST',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 201 when request post thread with correct body request', async () => {
      // Arrange
      const requestPayload = {
        title: 'Laskar',
        body: 'blablabla',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 404 when request get Detail Thread with invalid threadId request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      await CommentTableTestHelper.addComment({});

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/ngasal',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 200 when request get Detail Thread with valid threadId request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      await CommentTableTestHelper.addComment({});
      await CommentTableTestHelper.postLikeOnComment({}, {});
      await ReplyTableTestHelper.addReply({ date: '20/08/2021' });
      await ReplyTableTestHelper.addReply({ date: '15/08/2021', id: 'reply-456', content: 'biasa aja' });
      await ReplyTableTestHelper.addReply({ date: '28/08/2021', id: 'reply-678', content: 'mantappu jiwa' });
      const threadId = 'thread-123';

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: `/threads/${threadId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.comments).toBeInstanceOf(Array);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
    });
  });

  // ======================================= Comment Use Case
  describe('comment fiture testing', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentTableTestHelper.cleanTable();
    });

    it('should response 404 when request post comment with invalid threadId request', async () => {
      // Arrange
      const requestPayload = {
        content: 'dummy',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/ngasal/comments',
        method: 'POST',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 400 when request post comment with invalid body request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments',
        method: 'POST',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 201 when request post comment with correctly', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      const requestPayload = {
        content: 'dummy',
      };

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments',
        method: 'POST',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
    });

    it('should response 404 when request delete comment with invalid comentId request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      await CommentTableTestHelper.addComment({});

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/ngasal',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Maaf komentar tidak tersedia');
    });

    it('should response 403 when request delete comment with invalid credentialId request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'Lalu Naufal Azmi' });
      await ThreadsTableTestHelper.createThread({ owner: 'user-456', id: 'thread-456' });
      await CommentTableTestHelper.addComment({ owner: 'user-456', threadId: 'thread-456', id: 'comment-456' });

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-456/comments/comment-456',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak menghapus comment ini');
    });

    it('should response 200 when request delete comment with valid body request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      await CommentTableTestHelper.addComment({});

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when request post like in comment with valid body request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      await CommentTableTestHelper.addComment({});
      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/likes',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  // ======================================= Reply Use Case
  describe('reply fiture testing', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentTableTestHelper.cleanTable();
      await ReplyTableTestHelper.cleanTable();
    });

    it('should response 404 when request post reply with invalid commentId request', async () => {
      // Arrange
      const requestPayload = {
        content: 'dummy',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/ngasal/replies',
        method: 'POST',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Maaf komentar tidak tersedia');
    });

    it('should response 400 when request post reply with invalid body request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      await CommentTableTestHelper.addComment({});

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies',
        method: 'POST',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 201 when request reply comment with correctly', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      await CommentTableTestHelper.addComment({});

      const requestPayload = {
        content: 'dummy',
      };

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies',
        method: 'POST',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
    });

    it('should response 404 when request delete reply with invalid replyId request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      await CommentTableTestHelper.addComment({});
      await ReplyTableTestHelper.addReply({});

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies/ngasal',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Maaf reply tidak tersedia');
    });

    it('should response 403 when request delete reply with invalid credentialId request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'Lalu Naufal Azmi' });
      await ThreadsTableTestHelper.createThread({ owner: 'user-456', id: 'thread-456' });
      await CommentTableTestHelper.addComment({ owner: 'user-456', threadId: 'thread-456', id: 'comment-456' });
      await ReplyTableTestHelper.addReply({ owner: 'user-456', commentId: 'comment-456', id: 'reply-456' });

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-456/comments/comment-456/replies/reply-456',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak menghapus reply ini');
    });

    it('should response 200 when request delete reply with valid body request', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.createThread({});
      await CommentTableTestHelper.addComment({});
      await ReplyTableTestHelper.addReply({});

      const server = await createServer(Injection);

      // Action
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when GET /', () => {
    it('should return 200 and hello world', async () => {
      // Arrange
      const server = await createServer({});
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.value).toEqual('Hello world bro!');
    });
  });
});
