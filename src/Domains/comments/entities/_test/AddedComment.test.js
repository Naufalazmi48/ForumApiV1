const AddedComment = require('../AddedComment');

describe('a NewComment entities', () => {
  it('should throw error where not given 3 argument', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Karyanya bagus kak',
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error where argument type is invalid', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Karyanya bagus kak',
      owner: true,
    };
    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get correctly data', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Karyanya bagus kak',
      owner: 'user-123',
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment.threadId).toEqual(payload.threadId);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
