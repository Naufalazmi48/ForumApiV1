const NewReply = require('../NewReply');

describe('a NewComment entities', () => {
  it('should throw error where not given 4 argument', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'Karyanya bagus kak',
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error where argument type is invalid', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'Karyanya bagus kak',
      owner: true,
      date: '27092000',
      commentId: [],
    };
      // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get correctly data', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'commennt-123',
      content: 'Karyanya bagus kak',
      owner: 'user-123',
      date: '27/09/2000',
    };

    // Action
    const addedReply = new NewReply(payload);

    // Assert
    expect(addedReply.threadId).toEqual(payload.threadId);
    expect(addedReply.commentId).toEqual(payload.commentId);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
    expect(addedReply.date).toEqual(payload.date);
  });
});
