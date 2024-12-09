var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const ticketsSchema = new Schema({
    image_id: { type: String, required: false, default: '' },
    firstName: { type: String, required: false, default: '' },
    lastName: { type: String, required: false },
    email: { type: String, required: false, index: true, default: '' },
    subject : {type: String, required: false, default: '' },
    message : {type: String, required: false, default: ''},
    screenshot: {type: String, required: false, default: ''},
    status: { type: String, required: false, default: true },

}, {
    timestamps: true
});

ticketsSchema.set('toJSON', { virtuals: true, versionKey: false });

ticketsSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Tickets', ticketsSchema);