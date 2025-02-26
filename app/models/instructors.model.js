var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    contact_no: { type: String, required: true },
    instructor_image: { type: String, required: false },
    // instructor_available_dates: [{
    //     date: { type: Date, required: false, default: ''},
    //     status: { type: String, enum: ['Free', 'Engaged'], required: false, default: '' },
    //     course_assign: { type: String, default: '' }
    // }],
    instructor_available_dates: [
        {
          date: { type: Date, required: true },
          status: { type: String, default: 'Free' },
          course_assign: { type: String, default: '' },
        },
      ],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    updatedBy : {type: String, required: false, default: ''},
    assigned_courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }]
}, {
    timestamps: true
});

// instructorSchema.set('toJSON', {
//     transform: function (doc, ret, options) {
//         if (ret.instructor_available_dates) {
//             ret.instructor_available_dates.forEach(dateObj => {
//                 delete dateObj._id; // Remove _id field from each date object
//             });
//         }
//         return ret;
//     }
// });

instructorSchema.set('toJSON', { virtuals: true, versionKey: false });

instructorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Instructors', instructorSchema);