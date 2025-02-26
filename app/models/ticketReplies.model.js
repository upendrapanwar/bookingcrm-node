var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const ticketRepliesSchema = new Schema({
    ticketId: { type: Schema.Types.ObjectId,ref: "Tickets", required: false, default: '' },
    senderEmail: { type: String, required: false },
    recieverEmail: { type: String, required: false, default: '' },
    reply : {type: String, required: false, default: ''},
}, {
    timestamps: true
});

ticketRepliesSchema.set('toJSON', { virtuals: true, versionKey: false });

ticketRepliesSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('TicketReplies', ticketRepliesSchema);