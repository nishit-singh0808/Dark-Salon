"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import AdminNavbar from "./admin-navbar";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [cities, setCities] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [assignWorkerId, setAssignWorkerId] = useState("");

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => {
          const d = doc.data();
          const items = Array.isArray(d.items) ? d.items : [];

          return {
            id: doc.id,
            status: d.status?.toLowerCase() || "pending",
            userName: d.userInfo?.name || "Unknown",
            gender: d.userInfo?.gender || "—",
            contact: d.userInfo?.phone || "",
            address: `${d.userInfo?.houseNo || ""}, ${d.userInfo?.landmark || ""}`,
            city: d.userInfo?.city || "",
            createdAt: d.createdAt,
            startedAt: d.startedAt || null,
            completedAt: d.completedAt || null,
            cancelledAt: d.cancelledAt || null,
            cancelledBy: d.cancelledBy || null,
            cancelReason: d.cancellationReason || null,
            workerName: d.workerName || null,
            workerEmail: d.workerEmail || null,
            amount: d.total || 0,
            services: items.map((item) => item.name || "Service"),
          };
        });

        setOrders(data);
        setFilteredOrders(data);

        const uniqueCities = [...new Set(data.map((o) => o.city).filter(Boolean))];
        setCities(uniqueCities);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Fetch workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "workers"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setWorkers(data);
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };
    fetchWorkers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    if (statusFilter) filtered = filtered.filter((o) => o.status === statusFilter);
    if (cityFilter) filtered = filtered.filter((o) => o.city === cityFilter);

    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((o) => {
        const orderDate = o.createdAt?.toDate?.() || new Date();
        if (dateFilter === "today")
          return orderDate.toDateString() === now.toDateString();
        if (dateFilter === "weekly") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return orderDate >= weekAgo;
        }
        if (dateFilter === "monthly") {
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        }
        if (dateFilter === "yearly")
          return orderDate.getFullYear() === now.getFullYear();
        return true;
      });
    }

    setFilteredOrders(filtered);
  }, [statusFilter, cityFilter, dateFilter, orders]);

  // Assign worker logic (only if worker has no active order)
  const handleAssignWorker = async (orderId) => {
    if (!assignWorkerId) return;

    const worker = workers.find((w) => w.id === assignWorkerId);
    if (!worker) return;

    try {
      // check if worker already has an active order
      const activeOrdersQuery = query(
        collection(db, "orders"),
        where("workerEmail", "==", worker.email),
        where("status", "in", ["confirmed", "ongoing"])
      );
      const activeOrdersSnapshot = await getDocs(activeOrdersQuery);
      if (!activeOrdersSnapshot.empty) {
        alert(`${worker.name} already has an active order.`);
        return;
      }

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        workerEmail: worker.email,
        workerName: worker.name,
        status: "confirmed",
      });

      // update UI immediately
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, workerName: worker.name, workerEmail: worker.email, status: "confirmed" }
            : o
        )
      );

      alert(`Order assigned to ${worker.name}`);
      setAssignWorkerId("");
    } catch (error) {
      console.error("Error assigning worker:", error);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Orders</h1>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {/* same filters as before */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#222",
              color: "white",
              cursor: "pointer",
              minWidth: "160px",
              outline: "none",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.borderColor = "#ffd28f")}
            onMouseOut={(e) => (e.target.style.borderColor = "#444")}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="cancel by worker">Cancel by Worker</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#222",
              color: "white",
              cursor: "pointer",
              minWidth: "150px",
              outline: "none",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.borderColor = "#ffd28f")}
            onMouseOut={(e) => (e.target.style.borderColor = "#444")}
          >
            <option value="">Cities</option>
            {cities.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#222",
              color: "white",
              cursor: "pointer",
              minWidth: "150px",
              outline: "none",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.borderColor = "#ffd28f")}
            onMouseOut={(e) => (e.target.style.borderColor = "#444")}
          >
            <option value="all">Time</option>
            <option value="today">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
          </select>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <p style={{ textAlign: "center" }}>No orders found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {filteredOrders.map((o) => (
              <li
                key={o.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "15px",
                  background: "black",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p>
                    <strong>Service:</strong> {o.services.join(", ")}
                  </p>
                  <p>
                    <strong>User:</strong> {o.userName}
                  </p>
                  <p>
                    <strong>City:</strong> {o.city}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{o.amount}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span style={{ textTransform: "capitalize" }}>{o.status}</span>
                  </p>

                  {/* worker assign for pending orders */}
                  {o.status === "pending" && (
                    <div style={{ marginTop: "10px" }}>
                      <select
                        value={assignWorkerId}
                        onChange={(e) => setAssignWorkerId(e.target.value)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #444",
                          background: "#222",
                          color: "white",
                          cursor: "pointer",
                          marginRight: "5px",
                        }}
                      >
                        <option value="">Select Worker</option>
                        {[...workers] // create a copy to sort
                          .filter((w) => w.status !== "busy") // only free workers
                          .sort((a, b) => {
                            if (!a.city) return 1;
                            if (!b.city) return -1;
                            return a.city.localeCompare(b.city); // sort by city
                          })
                          .map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name} ({w.city || "—"})
                            </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignWorker(o.id)}
                        style={{
                          background: "#25D366",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedOrder(o)}
                  style={{
                    background: "#ffd28f",
                    color: "black",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    height: "fit-content",
                  }}
                >
                  Details
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Details Modal */}
        {selectedOrder && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                background: "#111",
                color: "white",
                padding: "20px",
                borderRadius: "10px",
                maxWidth: "600px",
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <h2>Order Details</h2>
              <p>
                <strong>User:</strong> {selectedOrder.userName}
              </p>
              <p>
                <strong>Worker:</strong>{" "}
                {selectedOrder.workerName || "Not Assigned"}
              </p>
              <p>
                <strong>Placed:</strong>{" "}
                {selectedOrder.createdAt?.toDate?.().toLocaleString()}
              </p>
              {selectedOrder.cancelledAt && (
                <p>
                  <strong>Cancelled:</strong>{" "}
                  {selectedOrder.cancelledAt?.toDate?.().toLocaleString()}
                </p>
              )}
              {selectedOrder.completedAt && (
                <p>
                  <strong>Completed:</strong>{" "}
                  {selectedOrder.completedAt?.toDate?.().toLocaleString()}
                </p>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  marginTop: "15px",
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
