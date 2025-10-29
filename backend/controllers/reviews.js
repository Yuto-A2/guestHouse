const Guest = require('../models/guest');
const Property = require('../models/property');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  try {
    if (!req.user || (req.isAuthenticated && !req.isAuthenticated())) {
      return res.status(401).json({ error: "You must be logged in to write a review" });
    }

    // ★ ここを修正：親ルータの :id がゲストID
    const { id: guestId } = req.params;
    const { propertyId, review: reviewPayload } = req.body || {};
    if (!propertyId) return res.status(400).json({ error: "propertyId is required" });

    const [guest, property] = await Promise.all([
      Guest.findById(guestId),
      Property.findById(propertyId),
    ]);
    if (!guest) return res.status(404).json({ error: "Guest not found" });
    if (!property) return res.status(404).json({ error: "Property not found" });

    if (String(req.user._id) !== String(guest._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const dup = await Review.exists({ author: guest._id, property: property._id });
    if (dup) return res.status(409).json({ error: "You have already reviewed this property" });

    const review = new Review({
      body: reviewPayload?.body,
      rating: reviewPayload?.rating,
      author: guest._id,
      property: property._id,
    });

    await review.save();

    await Property.updateOne(
      { _id: property._id },
      { $addToSet: { reviews: review._id } }
    );

    return res.status(201).json({ message: "Review created", reviewId: review._id });
  } catch (err) {
    console.error(err);
    if (err?.code === 11000) {
      return res.status(409).json({ error: "You have already reviewed this property" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.deleteReview = async (req, res) => {
  try {
    if (!req.user || (req.isAuthenticated && !req.isAuthenticated())) {
      return res.status(401).json({ error: 'You must be logged in to delete a review' });
    }

    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (!review.author || !review.author.equals(req.user._id)) {
      return res.status(403).json({ error: 'You do not have permission to delete this review' });
    }

    await Property.findByIdAndUpdate(review.property, { $pull: { reviews: review._id } });
    await review.deleteOne();

    return res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports.deleteReview = async (req, res) => {
  try {
    if (!req.user || (req.isAuthenticated && !req.isAuthenticated())) {
      return res.status(401).json({ error: 'You must be logged in to delete a review' });
    }
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (!review.author || !review.author.equals(req.user._id)) {
      return res.status(403).json({ error: 'You do not have permission to delete this review' });
    }

    await Guest.findByIdAndUpdate(id, { $pull: { reviews: review._id } });
    await review.deleteOne();
    return res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};