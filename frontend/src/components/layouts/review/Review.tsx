import { useState } from "react";
import Button from "../button/Button";
import "./review.css";

type User = {
  _id?: string;
  id?: string;
  fname: string;
  lname: string;
};

type ReviewProps = {
  _id?: string;
  id?: string;
  body: string;
  rating: number;
  author: User;
};

type ReviewComponentProps = {
  guestId: string;          
  propertyId: string;        
};

export default function Review({ guestId, propertyId }: ReviewComponentProps) {
  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const uiValue = 6 - rating;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMsg("");
    setSubmitting(true);
    try {
    
      if (!guestId) {
        setMsg("Please log in to leave a review.");
        return;
      }

      const res = await fetch(
        `https://guest-house-ecru.vercel.app/guests/${encodeURIComponent(guestId)}/reviews`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId, review: { body, rating: Number(rating) } }),
        }
      );

      if (res.status === 409) {
        setMsg("You have already reviewed this property.");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create review");

      setMsg("Successfully posted review!");
      setBody("");
      setRating(5);

      document.dispatchEvent(new Event("reviews-updated"));
    } catch (err: any) {
      setMsg(err?.message || "Failed to post review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h3>Leave a Review</h3>

      <form className="formContainer" onSubmit={onSubmit}>
        <textarea
          id="review-text"
          className="textBox"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Please leave your review here..."
          required
          disabled={submitting}
        />

        <fieldset
          className="starability-basic mb-3"
          aria-label="Star rating"
          aria-disabled={submitting}
        >
          <input
            type="radio"
            id="rate5"
            name="rating"
            value={5}
            checked={uiValue === 5}
            onChange={() => setRating(6 - 5)}
            disabled={submitting}
          />
          <label htmlFor="rate5" title="1 star">5 stars</label>

          <input
            type="radio"
            id="rate4"
            name="rating"
            value={4}
            checked={uiValue === 4}
            onChange={() => setRating(6 - 4)} // = 2
            disabled={submitting}
          />
          <label htmlFor="rate4" title="2 stars">4 stars</label>

          <input
            type="radio"
            id="rate3"
            name="rating"
            value={3}
            checked={uiValue === 3}
            onChange={() => setRating(6 - 3)} // = 3
            disabled={submitting}
          />
          <label htmlFor="rate3" title="3 stars">3 stars</label>

          <input
            type="radio"
            id="rate2"
            name="rating"
            value={2}
            checked={uiValue === 2}
            onChange={() => setRating(6 - 2)} // = 4
            disabled={submitting}
          />
          <label htmlFor="rate2" title="4 stars">2 stars</label>

          <input
            type="radio"
            id="rate1"
            name="rating"
            value={1}
            checked={uiValue === 1}
            onChange={() => setRating(6 - 1)} // = 5
            disabled={submitting}
          />
          <label htmlFor="rate1" title="5 stars">1 star</label>

          <span className="starability-focus-ring"></span>
        </fieldset>

        <Button
          className="reviewBtn"
          type="submit"
          text={submitting ? "Sending..." : "Send"}
          disabled={submitting}
        />

        {msg && (
          <p className="msg" aria-live="polite">
            {msg}
          </p>
        )}
      </form>
    </>
  );
}
