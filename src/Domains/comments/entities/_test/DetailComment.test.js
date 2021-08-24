const DetailComment = require('../DetailComment');

describe('a Detail Comment Entities', () => {
  it('should throw error when not given 5 argument', () => {
    // Arrange
    const payload = {
      id: 'user-123',
      username: 'dicoding',
      content: 'mantap bro',
      date: 'oke siap',
    };
    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when given invalid type', () => {
    // Arrange
    const payload = {
      id: 'user-123',
      username: 'dicoding',
      content: 'mantap bro',
      date: '27/09/2000',
      isDelete: 'false',
      replies: [],
    };
    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get correctly data', () => {
    // Arrange
    const payload = {
      id: 'user-123',
      username: 'dicoding',
      content: 'mantap bro',
      date: '27/09/2000',
      isDelete: true,
      replies: [],
    };
    const expectedDetailComment = {
      id: payload.id,
      username: payload.username,
      content: DetailComment.DELETED_COMMENT_CONTENT,
      date: payload.date,
      replies: payload.replies,
    };
    // Action
    const detailComment = new DetailComment(payload);
    // Assert
    expect(detailComment).toEqual(expectedDetailComment);
  });
});
