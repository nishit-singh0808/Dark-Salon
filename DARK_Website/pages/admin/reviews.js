"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import AdminNavbar from './admin-navbar';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch reviews
 const fetchReviews = async () => {
  setLoading(true);
  try {
    const querySnapshot = await getDocs(collection(db, "reviews")); // ✅ no orderBy
    const reviewsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Fetched reviews:", reviewsData); // 🔍 check in browser console
    setReviews(reviewsData);
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
  setLoading(false);
};


  useEffect(() => {
    fetchReviews();
  }, []);

  // ✅ Delete review
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this review?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews(reviews.filter((review) => review.id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <>
    <AdminNavbar />
    <div style={{ padding: "20px" }}>
      <h1>All Reviews</h1>
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {reviews.map((review) => (
            <li
              key={review.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "10px",
                background: "black",
                color: "white",
                display: "flex",
                justifyContent: "space-between", // ✅ button goes right
                alignItems: "center",
              }}
            >
              <div>
                <p><strong>Name:</strong> {review.name || "Anonymous"}</p>
                <p><strong>Review:</strong> {review.text || "No review text"}</p>
                <p>
                  <strong>Rating:</strong>{" "}
                  {"⭐".repeat(review.rating || 0)} ({review.rating || 0})
                </p>
              </div>

              <button
                onClick={() => handleDelete(review.id)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  height: "fit-content",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  );
}
