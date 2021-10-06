const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArtistsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true,
        default: '/files/covers/default.jpg'
    },
    albums: [{
        type: Schema.Types.ObjectId,
        ref: 'albums'
    }]
});

ArtistsSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 

module.exports = mongoose.model('artists', ArtistsSchema, 'artists');