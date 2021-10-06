const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlbumsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref: 'artists'
    },
    imageUrl: {
        type: String,
        required: true,
        default: '/files/covers/default.png'
    },
    year: {
        type: String,
        required: true
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'songs'
    }]
});

AlbumsSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('albums', AlbumsSchema, 'albums');