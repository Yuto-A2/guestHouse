const Guest = require('../models/guest');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  try {
    if (!req.user || (req.isAuthenticated && !req.isAuthenticated())) {
      return res.status(401).json({ error: "You must be logged in to write a review" });
    }

    const { id } = req.params; 
    const guest = await Guest.findById(id);
    if (!guest) return res.status(404).json({ error: "Guest not found" });

    const review = new Review({
      ...req.body.review,        
      author: req.user._id,
      guest: guest._id,
    });

    await review.save(); 
    guest.reviews.push(review._id);
    await guest.save();

    return res.status(201).json({ message: "Review created", reviewId: review._id });
  } catch (err) {
    console.error(err);
    if (err?.code === 11000) {
      return res.status(409).json({ error: "You can only leave one review for this property" });
    }
    return res.status(500).json({ error: "Internal server error" });
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