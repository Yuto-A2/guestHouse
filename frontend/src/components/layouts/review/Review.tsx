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
};

export default function Review({ guestId }: ReviewComponentProps) {
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `https://guest-house-ecru.vercel.app/guests/${guestId}/reviews`,
        // `http://localhost:5000/guests/${guestId}/reviews`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review: { body, rating } }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create review");

      setMsg("レビュー投稿に成功しました！");
      setBody("");
      setRating(5);
    } catch (err: any) {
      setMsg(err.message || "投稿に失敗しました。");
    }
  };

  return (
    <form className="formContainer" onSubmit={onSubmit}>
      <textarea
        className="textBox"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="レビューを書いてください"
        required
      />
      <select className="selectBox" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <Button className="reviewBtn" type="submit" text="Send" />
      {msg && <p>{msg}</p>}
    </form>
  );
}
