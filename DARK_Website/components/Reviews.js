import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";  // Import auth from your firebase config

function Reviews() {
  const PAGE_SIZE = 4;
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    fetchReviews();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchReviews = async () => {
    if (loadingRef.current) return;
    setLoading(true);
    loadingRef.current = true;

    try {
      let q;
      if (lastDoc) {
        q = query(
          collection(db, "reviews"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          collection(db, "reviews"),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE)
        );
      }

      const querySnapshot = await getDocs(q);
      const newReviews = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        newReviews.push({
          id: doc.id,
          name: data.name,
          text: data.text,
          rating: data.rating,
        });
      });

      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      setReviews((prev) => [...prev, ...newReviews]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }

    setLoading(false);
    loadingRef.current = false;
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !loadingRef.current
    ) {
      fetchReviews();
    }
  };

  const handleAddReview = async () => {
    if (rating > 0 && newReview.trim() !== "") {
      try {
        const user = auth.currentUser;
        const userName = user?.displayName || "Anonymous"; // fallback to "Anonymous"

        const docRef = await addDoc(collection(db, "reviews"), {
          name: userName,
          text: newReview,
          rating,
          createdAt: serverTimestamp(),
        });

        setReviews((prev) => [
          {
            id: docRef.id,
            name: userName,
            text: newReview,
            rating,
          },
          ...prev,
        ]);

        setRating(0);
        setNewReview("");
      } catch (error) {
        console.error("Error adding review:", error);
      }
    }
  };

  return (
    <div className="reviews-section d-flex bd-highlight" role="region" aria-label="Customer reviews">
      {/* Left - Leave a Review */}
      <div className="rating-box">
        <h2>Leave a Review</h2>
        <div className="stars" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              role="radio"
              tabIndex={0}
              aria-checked={rating >= star}
              className={rating >= star ? "star filled" : "star"}
              onClick={() => setRating(star)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setRating(star);
              }}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          placeholder="Write your review..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          aria-label="Write your review"
        />
        <button onClick={handleAddReview} className="review-button" aria-label="Add review">
          Add Review
        </button>
      </div>

      {/* Right - Customer Reviews */}
      <div className="customer-reviews">
        <h2>Customer Reviews</h2>
        <div className="reviews-list">
          {reviews.length === 0 && !loading && <p>No reviews yet.</p>}
          {reviews.map((review) => (
            <div key={review.id} className="review-card" tabIndex={0}>
              <div className="review-header">
                <strong>{review.name}</strong>
                <span className="review-stars" aria-label={`${review.rating} stars`}>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))}
          {loading && <p>Loading more reviews...</p>}
        </div>
      </div>

      <style jsx>{`
        .review-text {
          max-width: 270px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          line-height: 1.2em;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default Reviews;
