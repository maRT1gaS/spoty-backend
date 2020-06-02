const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name required']
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    library: [{
        type: Schema.Types.ObjectId,
        ref: 'songs'
    }],
    tags: {
        type: Object,
        required: true,
        default: new Object
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String
    },
    date: {
        type: String,
        default: Date.now
    }
});

UsersSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 

module.exports = mongoose.model('users', UsersSchema, 'users');