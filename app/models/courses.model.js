var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    course_title: { type: String, required: true },
    course_information : {type: String, required: false, default: ''},
    category: { type: String, required: false, default: '' },
    regular_price: { type: Number, required: true },
    sale_price: { type: Number, required: false },
    vat: { type: Number, required: false, default: 0 },
    availability: { type: String, required: true, default: 0 },
    course_time :{type: String, required: true, default: 0},
    course_image: { type: String, required: false, default: "" },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course_format: { type: String, required: true, default: 'Online' },
    enrollment_capacity: { type: Number, required: false, default: 0},
    isActive: { type: Boolean, default: true },
    training: {type: String, required: false, default: ""},
    additional_information : {type: String, required: false, default: ''},

}, {
    timestamps: true
});

courseSchema.set('toJSON', { virtuals: true, versionKey: false });

courseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Courses', courseSchema);
