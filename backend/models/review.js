const mongoose = require("mongoose");
const Schema = mongoose.Schema;

delete mongoose.models.Review;
const reviewSchema = new Schema({
    body: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Guest'
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: 'Guest',
        required: true
    }
});
module.exports = mongoose.model("Review", reviewSchema)