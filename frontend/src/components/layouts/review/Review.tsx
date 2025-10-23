import { useEffect, useMemo, useState } from "react";
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
};

export default function Review({ guestId }: ReviewComponentProps) {
  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 既存UIロジックは保持
  const uiValue = 6 - rating;

  // ★ localStorage/hasReviewed を完全撤廃（サーバーの応答で判断）
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMsg("");
    setSubmitting(true);
    try {
      const res = await fetch(
        `https://guest-house-ecru.vercel.app/guests/${guestId}/reviews`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review: { body, rating: Number(rating) } }),
        }
      );

      if (res.status === 409) {
        // 同じ guestId に対して既に本人のレビューがある（サーバー基準）
        setMsg("You can only leave one review for this guest.");
        // フォームは引き続き入力可（削除後や別物件で使えるように）
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create review");

      setMsg("Successfully posted review!");
      setBody("");
      setRating(5);

      // 下部の一覧があれば再読込イベント（無ければ何も起きません）
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

      {/* 既存の notice は hasReviewed 依存だったので撤去。メッセージは下の msg のみで出します */}

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
