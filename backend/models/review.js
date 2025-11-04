const mongoose = require("mongoose");
const Schema = mongoose.Schema;

delete mongoose.models.Review;
const reviewSchema = new Schema(
    {
        body: String,
        rating: { type: Number, min: 1, max: 5, required: true },
        author: { type: Schema.Types.ObjectId, ref: "Guest", required: true },
        property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    },
    {
        strict: "throw", 
    }
);
reviewSchema.index({ author: 1, property: 1 }, { unique: true });
module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);