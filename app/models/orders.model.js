var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: { type: String },
    country: { type: String, required: true },
    streetAddress: { type: String, required: false },
    flat: { type: String },
    city: { type: String, required: true },
    county: { type: String },
    postcode: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    acknowledge: { type: Boolean, required: false },
    // cardNumber: { type: String, required: false },
    // expiryDate: { type: String, required: false },
    // cvv: { type: String, required: false },
    paymentIntentID: { type: String, required: true },
    amount: { type: Number, required: true },
    courses: { type: Array, required: true },
    // courses: [{
    //     courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    //     quantity: { type: Number, required: true }
    // }],
}, {
    timestamps: true
});

orderSchema.set('toJSON', { virtuals: true, versionKey: false });

orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Orders', orderSchema);