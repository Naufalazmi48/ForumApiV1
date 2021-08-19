const DetailThread = require('../DetailThread');

describe('a DetailThread entities', () => {
  it('should throw error when given invalid argument', () => {
    // Arrange
    const thread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'dummy',
      date: '28092000',
      username: 'naufal',
    };

    // Action and Assert
    expect(() => new DetailThread(thread)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when given invalid type', () => {
    // Arrange
    const thread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'dummy',
      date: '28092000',
      username: 'naufal',
      comments: [{
        replies: false,
      }],
    };

    // Action and Assert
    expect(() => new DetailThread(thread)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get DetailThread object correctly', () => {
    // Arrange
    const replies = [{
      id: 'comment-123',
      username: 'dicoding',
      date: '27 09 2000',
      content: 'Kerennnn',
    }];

    const comments = [{
      id: 'comment-123',
      username: 'dicoding',
      date: '27 09 2000',
      content: 'Kerennnn',
      replies,
    }];

    const thread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'dummy',
      date: '28092000',
      username: 'naufal',
      comments,
    };

    // Action
    const detailThread = new DetailThread(thread);

    // Assert
    expect(detailThread.id).toEqual(thread.id);
    expect(detailThread.comments[0].id).toEqual(comments[0].id);
  });
});
