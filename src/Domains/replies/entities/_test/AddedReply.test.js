const AddedReply = require('../AddedReply');

describe('a AddedReply entities', () => {
  it('should throw error where not given 3 argument', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Karyanya bagus kak',
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error where argument type is invalid', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Karyanya bagus kak',
      owner: true,
    };
    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should get correctly data', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Karyanya bagus kak',
      owner: 'user-123',
    };

    // Action
    const addedReply = new AddedReply(payload);

    // Assert
    expect(addedReply.threadId).toEqual(payload.threadId);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
