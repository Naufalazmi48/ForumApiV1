class DetailComment {
    constructor(payload) {
        const payloadVerified = this._verify(payload);

        this.id = payloadVerified.id;
        this.username = payloadVerified.username;
        this.content = payloadVerified.content;
        this.date = payloadVerified.date;
        this.replies = payloadVerified.replies;
    }

    _verify(payload) {
        const { id, username, content, date, is_delete, replies } = payload;
        
        if (!id || !username || !content || !date || is_delete === undefined || !replies) {
            throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof username !== 'string' || typeof content !== 'string' ||
            typeof date !== 'string' || typeof is_delete !== 'boolean' || !(replies instanceof Array)) {
                throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
            }
        
        if (is_delete) {
            const newContent = '**komentar telah dihapus**'
            return { id, username, content:newContent, date, replies };
        }
        return { id, username, content, date, replies }
    }
}

module.exports = DetailComment;
