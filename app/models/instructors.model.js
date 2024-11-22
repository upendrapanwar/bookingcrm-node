var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    instructor_image: { type: String, required: false },
    instructor_unavailable_dates: { type: [Date], required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

instructorSchema.set('toJSON', { virtuals: true, versionKey: false });

instructorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Instructors', instructorSchema);