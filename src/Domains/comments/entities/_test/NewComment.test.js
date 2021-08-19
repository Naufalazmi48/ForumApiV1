const NewComment = require('../NewComment');

describe('a NewComment entities', () => {
  it('should throw error where not given 4 argument', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'Karyanya bagus kak',
    };

    // Action and Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error where argument type is invalid', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'Karyanya bagus kak',
      owner: true,
      date: '27092000',
    };
      // Action and Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get correctly data', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'Karyanya bagus kak',
      owner: 'user-123',
      date: '27/09/2000',
    };

    // Action
    const addedComment = new NewComment(payload);

    // Assert
    expect(addedComment.threadId).toEqual(payload.threadId);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
    expect(addedComment.date).toEqual(payload.date);
  });
});
