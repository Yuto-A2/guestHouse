import { useParams } from "react-router-dom";
import { useEffect, useState, useId } from "react";
import Button from "../button/Button";
import "./showReview.css";

// ---------- type definitions ----------
type Author =
    | string
    | { _id?: string; id?: string; fname?: string; lname?: string };

type PropertyInfo =
    | string
    | { _id?: string; id?: string; property_type?: string; address?: string };

type Review = {
    _id: string;
    id?: string;
    author: Author;
    property: PropertyInfo;
    body: string;
    rating: number;
};

// ---------- star rating component ----------
function StarRating({
    value,
    outOf = 5,
    size = 18,
    showNumber = false,
    title,
}: {
    value: number;
    outOf?: number;
    size?: number;
    showNumber?: boolean;
    title?: string;
}) {
    const uid = useId();
    const clamped = Math.max(0, Math.min(outOf, value));
    const label = title ?? `${clamped.toFixed(1)} / ${outOf}`;
    const path =
        "M12 .587l3.668 7.431 8.2 1.193-5.934 5.788 1.402 8.168L12 18.896l-7.336 3.871 1.402-8.168L.132 9.211l8.2-1.193z";

    return (
        <div
            className="star-rating"
            aria-label={label}
            title={label}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
            {Array.from({ length: outOf }).map((_, i) => {
                const filled = Math.max(0, Math.min(1, clamped - i));
                const clipId = `clip-${uid}-${i}`;
                return (
                    <svg
                        key={i}
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        style={{ display: "block" }}
                    >
                        <path d={path} fill="#e0e0e0" />
                        <defs>
                            <clipPath id={clipId}>
                                <rect x="0" y="0" width={24 * filled} height="24" />
                            </clipPath>
                        </defs>
                        <g clipPath={`url(#${clipId})`}>
                            <path d={path} fill="#fbbc04" />
                        </g>
                    </svg>
                );
            })}
            {showNumber && (
                <span style={{ fontSize: "0.9rem", color: "#555" }}>
                    {clamped.toFixed(1)} / {outOf}
                </span>
            )}
        </div>
    );
}

// ---------- review page main component ----------
export default function ShowReview() {
    const { id } = useParams<{ id: string }>();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [error, setError] = useState<string>("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteErr, setDeleteErr] = useState<string | null>(null);
    const [noReviews, setNoReviews] = useState(false); 

    useEffect(() => {
        if (!id) {
            setError("Route param id is missing.");
            return;
        }

        const fetchReviews = async () => {
            try {
                const res = await fetch(
                    `https://guest-house-ecru.vercel.app/guests/${encodeURIComponent(id)}/reviews`,
                    { method: "GET", credentials: "include" }
                );

                // 👇 404エラーなら「レビューなし」として扱う
                if (res.status === 404) {
                    setNoReviews(true);
                    return;
                }

                if (!res.ok) {
                    const t = await res.text().catch(() => "");
                    throw new Error(`Failed to load reviews: ${res.status} ${t}`);
                }

                const data = await res.json();
                const arr: Review[] = Array.isArray(data) ? data : [data];
                setReviews(arr);
                if (arr.length === 0) setNoReviews(true);
            } catch (e: any) {
                setError(e?.message ?? "Failed to load reviews.");
            }
        };

        fetchReviews();
    }, [id]);

    const authorName = (a: Author) => {
        if (typeof a === "string") return a;
        const f = a?.fname?.trim() ?? "";
        const l = a?.lname?.trim() ?? "";
        const name = [f, l].filter(Boolean).join(" ");
        return name || (a?._id || a?.id || "Unknown user");
    };

    const confirmDelete = async (reviewId: string) => {
        if (!id) return;
        setDeletingId(reviewId);
        setDeleteErr(null);

        try {
            const res = await fetch(
                `https://guest-house-ecru.vercel.app/guests/${encodeURIComponent(
                    id
                )}/reviews/${encodeURIComponent(reviewId)}`,
                { method: "DELETE", credentials: "include" }
            );

            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
            }

            setReviews((prev) => prev.filter((p) => p._id !== reviewId));
            if (reviews.length === 1) setNoReviews(true);
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Failed to delete review.";
            setDeleteErr(msg);
        } finally {
            setDeletingId(null);
        }
    };

    // ---------- UI ----------
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (noReviews) return <div>No reviews yet.</div>;

    return (
        <div>
            {deleteErr && (
                <p className="error" style={{ color: "crimson" }}>
                    {deleteErr}
                </p>
            )}

            {reviews.map((r) => (
                <article className="reviewContainer" key={r._id}>
                    <div>{r.body}</div>

                    <div aria-label="rating" style={{ margin: "6px 0" }}>
                        <StarRating value={r.rating} outOf={5} size={18} />
                    </div>

                    <div className="author">By: {authorName(r.author)}</div>

                    <Button
                        text="Delete"
                        className="deleteButton"
                        onClick={() => confirmDelete(r._id)}
                        disabled={deletingId === r._id}
                        aria-label={`Delete review ${r._id}`}
                    >
                        {deletingId === r._id ? "Deleting..." : "Delete"}
                    </Button>
                </article>
            ))}
        </div>
    );
}
