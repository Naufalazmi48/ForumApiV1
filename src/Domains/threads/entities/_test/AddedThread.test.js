const AddedThread = require('../AddedThread');

describe('a AddedThread entities', () => {
  it('should throw error when not given 3 argument', () => {
    // Arrange
    const payload = {
      id: 'thread-jahsuhsuhaj',
      title: 'tester',
    };

    // Action and assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when argument type is invalid', () => {
    // Arrange
    const payload = {
      id: 1234,
      title: true,
      owner: 'Naufal',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-Xjagdmhs',
      title: 'Laskar Pelangi',
      owner: 'users-Nbahbajndjbns',
    };

    // Action
    const newThread = new AddedThread(payload);

    // Assert
    expect(newThread.id).toEqual(payload.id);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.owner).toEqual(payload.owner);
  });
});
