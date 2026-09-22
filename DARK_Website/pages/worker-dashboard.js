"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [assignedOrder, setAssignedOrder] = useState(null);
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [showFinalOptions, setShowFinalOptions] = useState(false); // for collect cash + qr
  const [showQR, setShowQR] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cities] = useState(["Gurugram", "Delhi", "Greater Noida"]);
  const [selectedCity, setSelectedCity] = useState("Gurugram"); // default selected

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Check worker exists
      const workersRef = collection(db, "workers");
      const q = query(workersRef, where("email", "==", currentUser.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        router.push("/");
      } else {
        const stopStats = listenWorkerStats(currentUser.email);
        const stopAssigned = listenAssignedOrder(currentUser.email);

        setLoading(false);

        // Cleanup on unmount
        return () => {
          stopStats();
          stopAssigned();
        };
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 🔹 Live stats listener (orders + ratings)
const listenWorkerStats = (email) => {
  const ordersRef = collection(db, "orders");

  // Listen to completed orders
  const ordersQuery = query(
    ordersRef,
    where("workerEmail", "==", email),
    where("status", "==", "completed")
  );

  const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
    setTotalOrders(snapshot.size); // total completed orders

    let totalRating = 0;
    let count = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rating != null) {
        totalRating += data.rating;
        count++;
      }
    });

    setAverageRating(count > 0 ? (totalRating / count).toFixed(1) : 0);
  });

  return unsubscribe;
};


 // 🔹 Listen for assigned orders (confirmed / ongoing)
const listenAssignedOrder = (email) => {
  const ordersRef = collection(db, "orders");
  const q = query(
    ordersRef,
    where("workerEmail", "==", email),
    where("status", "in", ["confirmed", "ongoing"])
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    if (!snapshot.empty) {
      // Take the first order (or you can map multiple if needed)
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      setAssignedOrder({
        id: docSnap.id,
        ...data,
      });

      // ✅ Update worker status -> busy
      const workersRef = collection(db, "workers");
      const workerQuery = query(workersRef, where("email", "==", email));
      const workerSnap = await getDocs(workerQuery);
      if (!workerSnap.empty) {
        await updateDoc(workerSnap.docs[0].ref, {
          status: "busy",
        });
      }
    } else {
      setAssignedOrder(null);

      // ✅ No assigned order -> set status back to available
      const workersRef = collection(db, "workers");
      const workerQuery = query(workersRef, where("email", "==", email));
      const workerSnap = await getDocs(workerQuery);
      if (!workerSnap.empty) {
        await updateDoc(workerSnap.docs[0].ref, {
          status: "free",
        });
      }
    }
  });

  return unsubscribe;
};

const handleCitySelect = async (city) => {
  setSelectedCity(city);

  if (!user) return;

  // Find the worker doc by email
  const workersRef = collection(db, "workers");
  const q = query(workersRef, where("email", "==", user.email));
  const workerSnap = await getDocs(q);

  if (!workerSnap.empty) {
    const workerDoc = workerSnap.docs[0];
    await updateDoc(workerDoc.ref, {
      city: city, // Save selected city
    });
  }
};

  const handleStartService = async () => {
    if (!assignedOrder) return;
    const orderRef = doc(db, "orders", assignedOrder.id);
    await updateDoc(orderRef, {
      status: "ongoing",
      startedAt: serverTimestamp(),
    });
  };

  // End Service just shows final options (Collect Cash + Show QR)
  const handleEndService = () => {
    setShowFinalOptions(true);
  };

  const handleCollectCash = async () => {
    if (!assignedOrder) return;
    const orderRef = doc(db, "orders", assignedOrder.id);
    await updateDoc(orderRef, {
      status: "completed",
      completedAt: serverTimestamp(),
    });
    setShowFinalOptions(false);
    setShowQR(false);
  };

  const handleCancel = () => {
    setShowCancelOptions(true);
  };

  const handleCancelOption = async (option) => {
    if (!assignedOrder) return;
    const orderRef = doc(db, "orders", assignedOrder.id);

    if (option === "user") {
      // Only show QR, no status change
      setShowQR(true);
    } else if (option === "worker") {
      await updateDoc(orderRef, { status: "pending" });
    }
    setShowCancelOptions(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

// 🔹 Helper to add money to worker
// type: "cash" or "qr"
const addMoneyToWorker = async (amount, type = "cash") => {
  if (!user) return;

  const workersRef = collection(db, "workers");
  const q = query(workersRef, where("email", "==", user.email));
  const workerSnap = await getDocs(q);

  if (!workerSnap.empty) {
    const workerDoc = workerSnap.docs[0];
    const workerData = workerDoc.data();

    const update = {};

    if (type === "qr") {
      update.qrAmount = (Number(workerData.qrAmount || 0) + amount);
    } else {
      update.cashAmount = (Number(workerData.cashAmount || 0) + amount);
    }

    await updateDoc(workerDoc.ref, update);
  }
};



  const handleHelp = () => {
    const whatsappNumber = "919876543210";
    window.open(`https://wa.me/${whatsappNumber}`, "_blank");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {/* Navbar */}
      <nav className="admin-navbar-container">
        <div>
          <Image src="/images/small-logo.jpg" alt="Logo" width={180} height={80} />
        </div>
        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={28} color="#fff" /> : <FiMenu size={28} color="#fff" />}
        </div>

        <div className={`admin-navbar-menu ${isOpen ? "open" : ""}`}>
          <div>
            <strong>Orders:</strong> {totalOrders}
          </div>
          <div>
            <strong>Rating:</strong> {averageRating} ⭐
          </div>
          <button
            onClick={handleHelp}
            style={{
              backgroundColor: "black",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              color: "white",
            }}
          >
            Help & Support
          </button>
          <button
            onClick={handleLogout}
            className="admin-navbar-logout-button"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* 🔴 SOS Button */}
      <div style={{ margin: "20px", textAlign: "center" }}>
        <button
          onClick={() => {
            if (!assignedOrder) return alert("No assigned order to send SOS.");

            const {
              userInfo,
              workerEmail,
              workerName,
              userLocationLink, // top-level property
            } = assignedOrder;

            const message = encodeURIComponent(
              `SOS Alert!\n\n` +
              `Worker: ${workerName} (${workerEmail})\n` +
              `Client Name: ${userInfo?.name}\n` +
              `Client Phone No: ${userInfo?.phone}\n` +
              `Client Address: ${userInfo?.address}, ${userInfo?.city}, ${userInfo?.pincode}\n` +
              `Client Location: ${userLocationLink ?? "Not provided"}\n`
            );

            const whatsappNumber = "918510948850"; // SOS recipient
            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
          }}
          style={{
            backgroundColor: "red",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          SOS
        </button>
      </div>

      {/* 🔹 Scrollable City Menu */}
      <div style={{ overflowX: "auto", whiteSpace: "nowrap", margin: "20px 0" }}>
        {cities.map((city, idx) => (
          <button
            key={idx}
            onClick={() => handleCitySelect(city)}
            style={{
              display: "inline-block",
              marginRight: "10px",
              padding: "8px 16px",
              borderRadius: "20px",
              border: selectedCity === city ? "2px solid #ffd28f" : "1px solid #ccc",
              backgroundColor: selectedCity === city ? "#ffd28f" : "black",
              color: selectedCity === city ? "black" : "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Assigned Order */}
      <div style={{ margin: "40px 20px" }}>
        <h2>Assigned Order</h2>
        {!assignedOrder ? (
          <p>No order assigned yet.</p>
        ) : (
          <div
            style={{
              border: "2px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              color: "white",
              backgroundColor: "black",
              position:"relative",
            }}
          >
            <p><strong>User Name:</strong> {assignedOrder.userInfo?.name}</p>
            <p><strong>Phone No:</strong> {assignedOrder.userInfo?.phone}</p>
            <p>
              <strong>Address:</strong>{" "}
              {assignedOrder.userInfo?.address}, {assignedOrder.userInfo?.city},{" "}
              {assignedOrder.userInfo?.pincode}
            </p>
          <p>
            <strong>Location Link:</strong>{" "}
            {assignedOrder?.userInfo && assignedOrder.userLocationLink ? (
              <a
                href={assignedOrder.userLocationLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffd28f", textDecoration: "none" }}
              >
                View Location
              </a>
            ) : (
              "Not provided"
            )}
          </p>  
            <p><strong>Total Amount:</strong> ₹{assignedOrder.total}</p>
            <div>
              <strong>Services:</strong>
              <ul>
                {assignedOrder.items?.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x {item.quantity} = ₹
                    {item.price * item.quantity}
                  </li>
                ))}
              </ul>
            </div>
{/* 🔴 Top Right: Cancel + Options */}
{assignedOrder?.status === "confirmed" && !showFinalOptions && (
  <div style={{ position: "absolute", top: "10px", right: "10px" }}>
    {/* Show Cancel initially */}
    {!showCancelOptions ? (
      <button
        onClick={() => {
          setShowCancelOptions(true);
          setShowFinalOptions(false);
          setShowQR(false);
        }}
        style={{
          backgroundColor: "#FF4C4C",
          color: "#fff",
          border: "none",
          padding: "8px 14px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Cancel
      </button>
    ) : (
      <div style={{ display: "flex", gap: "8px" }}>
        {/* ✅ User Ask → switch to final flow */}
        <button
          onClick={() => {
            setShowCancelOptions(false);   // 🔴 removes cancel block
            setShowFinalOptions(true);     // ✅ shows Collect Cash + Show QR
          }}
          style={{
            backgroundColor: "#228B22",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          User Ask
        </button>

        {/* ✅ Cancel by Worker */}
        <button
          onClick={async () => {
            if (!assignedOrder) return;
            const orderRef = doc(db, "orders", assignedOrder.id);
            await updateDoc(orderRef, { status: "pending" });
            setShowCancelOptions(false);   // 🔴 removes cancel block
          }}
          style={{
            backgroundColor: "#B00000",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Cancel by Worker
        </button>
      </div>
    )}
  </div>
)}


{/* 🟢 Bottom Right: Service Flow */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
    gap: "10px",
  }}
>
  {/* ✅ Start Service → only show End Service */}
  {assignedOrder.status === "confirmed" &&
    !showCancelOptions &&
    !showFinalOptions && (
      <button
        onClick={async () => {
          await handleStartService();
          setShowFinalOptions(false);
          setShowCancelOptions(false); // hide cancel permanently
        }}
        style={{
          backgroundColor: "#007AFF",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Start Service
      </button>
    )}

  {/* ✅ After Start Service → End Service only */}
  {assignedOrder.status === "ongoing" &&
    !showFinalOptions &&
    !showCancelOptions && (
      <button
        onClick={() => {
          setShowFinalOptions(true);
          setShowCancelOptions(false); // hide cancel permanently
        }}
        style={{
          backgroundColor: "red",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        End Service
      </button>
    )}

{/* Final Options (Collect Cash + Show QR) */}
{showFinalOptions && !showCancelOptions && (
  <>
    {/* Collect Cash Button */}
    <button
      onClick={async () => {
        if (!assignedOrder) return;
        const orderRef = doc(db, "orders", assignedOrder.id);

        // Determine amount to add
        const amountToAdd =
          assignedOrder.status === "confirmed" ? 150 : Number(assignedOrder.total || 0);

        // ✅ Add money to cash only when clicked
        await addMoneyToWorker(amountToAdd, "cash");

        // Update order status
        if (assignedOrder.status === "confirmed") {
          await updateDoc(orderRef, {
            status: "cancelled",
            completedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(orderRef, {
            status: "completed",
            completedAt: serverTimestamp(),
          });
        }

        setShowFinalOptions(false);
        setShowQR(false);
      }}
      style={{
        backgroundColor: "green",
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Collect Cash
    </button>

    {/* Show QR Button */}
    <button
      onClick={async () => {
        if (!assignedOrder) return;

        // Determine amount to add
        const amountToAdd =
          assignedOrder.status === "confirmed" ? 150 : Number(assignedOrder.total || 0);

        // ✅ Add money to QR only when clicked
        await addMoneyToWorker(amountToAdd, "qr");

        // Show QR
        setShowQR(true);
      }}
      style={{
        backgroundColor: "#ffd28f",
        color: "black",
        border: "none",
        padding: "8px 16px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Show QR
    </button>
  </>
)}
</div>

          </div>
        )}
      </div>
    </div>
  );
}
