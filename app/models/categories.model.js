var mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
    category: { type: String, required: false, default: '' },
    slug: { type: String, unique: true, required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Categories', required: false, default: null },
    description : {type: String, required: false, default: ''},
    isActive: { type: Boolean, required: false, default: true },
}, {
    timestamps: true
});

categoriesSchema.set('toJSON', { virtuals: true, versionKey: false });

categoriesSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Categories', categoriesSchema);