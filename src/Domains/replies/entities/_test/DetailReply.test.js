const DetailReply = require('../DetailReply');

describe('a Detail Reply Entities', () => {
    it('should throw error when not given 5 argument', () => {
        // Arrange 
        const payload = {
            id: 'user-123',
            username: 'dicoding',
            content: 'mantap bro',
            date: 'oke siap',
        }
        // Action and Assert
        expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
    })

    it('should throw error when given invalid type', () => {
        // Arrange 
        const payload = {
            id: 'user-123',
            username: 'dicoding',
            content: 'mantap bro',
            date: '27/09/2000',
            is_delete: 'false',
        }
        // Action and Assert
        expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
    })

    it('should get correctly data', () => {
        // Arrange 
        const payload = {
            id: 'user-123',
            username: 'dicoding',
            content: 'mantap bro',
            date: '27/09/2000',
            is_delete: true,
        }
        const expectedDetailReply = {
            id: payload.id,
            username: payload.username,
            content: '**balasan telah dihapus**',
            date: payload.date,
        }
        // Action
        const detailReply = new DetailReply(payload);
        // Assert
        expect(detailReply).toEqual(expectedDetailReply);
    })
})