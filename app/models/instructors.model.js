var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    contact_no: { type: String, required: true },
    instructor_image: { type: String, required: false },
    instructor_unavailable_dates: { type: [Date], required: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy : {type: String, required: false, default: ''},
}, {
    timestamps: true
});

instructorSchema.set('toJSON', { virtuals: true, versionKey: false });

instructorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Instructors', instructorSchema);