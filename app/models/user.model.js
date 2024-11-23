var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;
const schema = new Schema({
    first_name: { type: String, required: false, default: '' },
    last_name: { type: String, required: false, default: '' },
    gender: { type: String, required: false, default: '' },
    email: { type: String, unique: true, required: false, index: true, default: '' },
    phone: { type: String, required: false, default: '' },
    role: { type: String, required: false, default: 'student' },
    address: { type: String, required: false, default: '' },
    city: { type: String, required: false, default: '' },
    state: { type: String, required: false, default: '' },
    country: { type: String, required: false, default: '' },
    postcode: { type: String, required: false, default: '' },
    isActive: { type: Boolean, required: false, default: true },
}, {
    timestamps: true
});

schema.set('toJSON', { virtuals: true, versionKey: false });

schema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', schema);