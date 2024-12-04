var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    paymentIntentID: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    amount: { type: Number, required: true },
    toPay: { type: Number, required: false, default:'' },
    futurePay: { type: Number, required: false, default:'' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Orders', required: true },
    courses: { type: Array, required: true },
}, {
    timestamps: true
});

paymentSchema.set('toJSON', { virtuals: true, versionKey: false });

paymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Payments', paymentSchema);