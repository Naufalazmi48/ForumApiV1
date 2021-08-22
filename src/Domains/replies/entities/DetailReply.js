class DetailReply {
    constructor(payload) {
        const payloadVerified = this._verify(payload);

        this.id = payloadVerified.id;
        this.username = payloadVerified.username;
        this.content = payloadVerified.content;
        this.date = payloadVerified.date;
    }

    _verify(payload) {
        const { id, username, content, date, is_delete } = payload;

        if (!id || !username || !content || !date || is_delete === undefined) {
            throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof username !== 'string' || typeof content !== 'string' ||
            typeof date !== 'string' || typeof is_delete !== 'boolean') {
                throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
            }
        
        if (is_delete) {
            const newContent = '**balasan telah dihapus**'
            return { id, username, content:newContent, date };
        }

        return { id, username, content, date }
    }
}

module.exports = DetailReply;
