var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  review: {
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

reviewSchema.set('toJSON', { virtuals: true, versionKey: false });

reviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Reviews', reviewSchema);
