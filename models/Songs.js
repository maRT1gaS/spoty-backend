const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SongsSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        require: true
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
    }],
    artist: {
        type: Schema.Types.ObjectId,
        ref: 'artists',
        required: true
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: 'albums',
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    listens: {
        type: Number,
        default: 0
    } 
});

SongsSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('songs', SongsSchema, 'songs');