const NewThread = require('../NewThread');

describe('a NewThread entities', () => {
  it('should throw error when not given 4 argument', () => {
    // Arrange
    const payload = {
      title: 'tester',
      body: 'blablabla',
    };

    // Action and assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when argument type is invalid', () => {
    // Arrange
    const payload = {
      title: true,
      body: 1234,
      owner: 'Naufal',
      date: '27092000',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Laskar pelangi',
      body: 'laskar pelangi adalah mimpi',
      owner: 'users-AHUXHUAGSG',
      date: '27092000',
    };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(payload.owner);
  });
});
