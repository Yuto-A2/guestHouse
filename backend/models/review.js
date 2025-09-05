const mongoose = require("mongoose");
const Schema = mongoose.Schema;

delete mongoose.models.Review;
const reviewSchema = new Schema ({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Guest'
    }
});

module.exports = mongoose.model("Review", reviewSchema)