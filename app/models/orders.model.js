var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

// const orderSchema = new Schema({
//     // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
//     firstName: { type: String, required: true },
//     lastName: { type: String, required: true },
//     companyName: { type: String },
//     country: { type: String, required: true },
//     streetAddress: { type: String, required: false },
//     flat: { type: String },
//     city: { type: String, required: true },
//     county: { type: String },
//     postcode: { type: String, required: true },
//     email: { type: String, required: true },
//     phoneNumber: { type: String, required: true },
//     acknowledge: { type: Boolean, required: false },
//     toPay: { type: Number, required: false, default:'' },
//     futurePay: { type: Number, required: false, default:'' },
//     paymentIntentID: { type: String, required: true },
//     amount: { type: Number, required: true },
//     courses: { type: Array, required: true },
//     // courses: [{
//     //     courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
//     //     quantity: { type: Number, required: true }
//     // }],
// }, {
//     timestamps: true
// });

const courseSchema = new Schema({
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: false },
    instructorName: { type: String, required: false },
    instructorEmail: { type: String, required: false }, 
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: false },
    course_title: { type: String, required: false },
    zoom_links: [{ type: String }], 
    course_price: { type: Number, required: false },
    course_quantity: { type: Number, required: false },
});

const orderSchema = new Schema({
    paymentIntentId: { type: String, required: false, default: '' }, 
    paymentStatus: { type: String, required: false }, 
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    amount: { type: Number, required: false, default:''}, 
    toPay: { type: Number, required: false, default:'' }, 
    futurePay: { type: Number, required: false , default:'' }, 
    courses: [courseSchema], 
}, {
    timestamps: true,
});

orderSchema.set('toJSON', { virtuals: true, versionKey: false });

orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Orders', orderSchema);