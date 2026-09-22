import NavbarComponent from "../components/Navbar";
import { Container } from "react-bootstrap";
import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#ffc107"; // yellow
      case "cancelled":
      case "cancel by worker":
        return "#dc3545"; // red
      case "completed":
        return "#28a745"; // green
      case "confirmed":
        return "#0d6efd"; // blue
      case "ongoing":
        return "#6c757d"; // gray
      default:
        return "#6c757d"; // fallback gray
    }
  };

useEffect(() => {
  let unsubscribe = () => {};

  const unsubscribeAuth = auth.onAuthStateChanged((user) => {
    if (!user) {
      setBookings([]);
      setLoading(false);

      // stop any active Firestore listener
      unsubscribe();
      return;
    }

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const orders = [];
        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        setBookings(orders);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching bookings: ", error);
        setBookings([]);
        setLoading(false);
      }
    );
  });

  return () => {
    unsubscribe();      // clean up Firestore listener
    unsubscribeAuth();  // clean up auth listener
  };
}, []);
  const handleRating = async (orderId, rating) => {
    try {
      const orderDocRef = doc(db, "orders", orderId);
      await updateDoc(orderDocRef, {
        rating: rating,
        ratedAt: serverTimestamp(),
      });
      alert(`Thanks for rating this order ${rating} stars!`);
    } catch (error) {
      console.error("Error submitting rating: ", error);
      alert("Failed to submit rating, please try again.");
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const orderDocRef = doc(db, "orders", orderId);
      await updateDoc(orderDocRef, {
        status: "cancelled",
        cancelledAt: new Date(),
      });
      alert("Booking cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling booking: ", error);
      alert("Failed to cancel booking, please try again.");
    }
  };

  return (
    <>
      <NavbarComponent />
      <Container
        fluid
        className="bookings-section"
        style={{
          padding: "2rem 1.5rem",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: bookings.length === 0 && !loading ? "center" : "flex-start",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#ffd28f" }}>My Bookings</h1>

        {loading ? (
          <p style={{ color: "#fff" }}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p style={{ color: "#fff", fontSize: "1.2rem", textAlign: "center" }}>You have no bookings.</p>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Service</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => {
                const createdTime = booking.createdAt?.toDate?.() || new Date();
                const isCancelable =
                  booking.status?.toLowerCase() === "pending" &&
                  Date.now() - createdTime.getTime() < 15 * 60 * 1000;

                return (
                  <tr key={booking.id}>
                    <td>{index + 1}</td>
                    <td>
                      {booking.items && booking.items.length > 0
                        ? booking.items.map((item) => item.name).join(", ")
                        : "N/A"}
                    </td>
                    <td>
                      {booking.date
                        ? booking.date
                        : booking.createdAt?.toDate
                        ? booking.createdAt.toDate().toLocaleDateString()
                        : ""}
                    </td>
                    <td>
                      {booking.total !== undefined
                        ? `₹${booking.total}`
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        style={{
                          background: getStatusColor(booking.status),
                          color: "#fff",
                          borderRadius: "0.5em",
                          padding: "0.25em 0.75em",
                          fontWeight: "bold",
                          display: "inline-block",
                        }}
                      >
                        {booking.status || "Unknown"}
                      </span>

                      {isCancelable && (
                        <button
                          style={{
                            marginLeft: "10px",
                            padding: "4px 10px",
                            backgroundColor: "#dc3545",
                            border: "none",
                            borderRadius: "0.3em",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </button>
                      )}
                      {/* ⭐ Rating section (only show if completed and not rated yet) */}
                      {booking.status?.toLowerCase() === "completed" && !booking.rating && (
                        <div style={{ marginTop: "10px" }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              style={{
                                cursor: "pointer",
                                fontSize: "20px",
                                color: "white", // gold
                                marginRight: "5px",
                              }}
                              onClick={() => handleRating(booking.id, star)}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Container>
    </>
  );
}
