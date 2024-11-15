var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    course_title: { type: String, required: true },
    category: { type: String, required: false, default: '' },
    course_type: { type: String, required: true, default: ''},
    regular_price: { type: Number, required: true },
    sale_price: { type: Number, required: false },
    vat: { type: Number, required: false, default: 0 },
    // availability: { type: String, required: true, default: 0 },
    // start_date: { type: String, required: true },
    // end_date: { type: String, required: true },
    course_schedule_dates: { type: [Date], required: false },
    course_time :{type: Array, required: true, default: []},
    course_image: { type: String, required: false, default: "" },
   // image_id:{ type: String, required: false, default: "" },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    course_format: { type: String, required: true, default: 'Online' },
    enrollment_capacity: { type: Number, required: true, default: 0},
    isActive: { type: Boolean, default: true },
    training: {type: String, required: false, default: ""},
    additional_information : {type: String, required: false, default: ''},
    updatedBy : {type: String, required: false, default: ''},
    course_information : {type: String, required: false, default: ''},
    completing_the_course: {type: String, required: false, default: ''},
}, {
    timestamps: true
});

courseSchema.set('toJSON', { virtuals: true, versionKey: false });

courseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Courses', courseSchema);
