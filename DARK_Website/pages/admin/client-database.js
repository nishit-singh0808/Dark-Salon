"use client";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import AdminNavbar from "./admin-navbar";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOrders, setClientOrders] = useState({
    pending: [],
    cancelled: [],
    "cancel by worker": [],
    completed: [],
    confirmed: [],
    ongoing: [],
    total: 0,
  });
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [cityFilter, setCityFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueGenders, setUniqueGenders] = useState([]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("name", "asc"));
      const snapshot = await getDocs(q);

      const clientsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = { id: doc.id, ...doc.data() };

          const ordersSnapshot = await getDocs(
            query(
              collection(db, "orders"),
              where("userId", "==", doc.id),
              orderBy("createdAt", "desc")
            )
          );

          const orders = ordersSnapshot.docs.map((o) => ({ id: o.id, ...o.data() }));
          data.totalOrders = orders.length;

          if (orders.length > 0) {
            data.lastOrderCity = orders[0].userInfo?.city || "—";
            return data;
          }
          return null; // skip users with 0 orders
        })
      );

      const filteredClients = clientsData.filter(Boolean);
      setClients(filteredClients);

      const citiesFromOrders = [
        ...new Set(
          filteredClients
            .map((c) => c.lastOrderCity)
            .filter((city) => city && city !== "—")
        ),
      ];
      setUniqueCities(citiesFromOrders);

      const genders = [
        ...new Set(filteredClients.map((c) => c.gender).filter(Boolean)),
      ];
      setUniqueGenders(genders);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClientOrders = async (clientId) => {
    try {
      const ordersSnapshot = await getDocs(
        query(collection(db, "orders"), where("userId", "==", clientId))
      );

      const orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const pending = orders.filter(
        (o) => (o.status || "").toLowerCase() === "pending"
      );
      const cancelled = orders.filter(
        (o) => (o.status || "").toLowerCase() === "cancelled"
      );
      const cancelByWorker = orders.filter(
        (o) => (o.status || "").toLowerCase() === "cancel by worker"
      );
      const completed = orders.filter(
        (o) => (o.status || "").toLowerCase() === "completed"
      );
      const confirmed = orders.filter(
        (o) => (o.status || "").toLowerCase() === "confirmed"
      );
      const ongoing = orders.filter(
        (o) => (o.status || "").toLowerCase() === "ongoing"
      );

      let total = 0;
      completed.forEach((o) => {
        total += o.total || 0;
      });
      confirmed.forEach((o) => {
        total += o.total || 0;
      });
      ongoing.forEach((o) => {
        total += o.total || 0;
      });
      cancelByWorker.forEach((o) => {
        if (o.cancellationReason?.toLowerCase() === "user ask") total += 150;
      });

      setClientOrders({
        pending,
        cancelled,
        "cancel by worker": cancelByWorker,
        completed,
        confirmed,
        ongoing,
        total,
      });
      setSelectedClient(clients.find((c) => c.id === clientId));
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching client orders:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
    setClientOrders({
      pending: [],
      cancelled: [],
      "cancel by worker": [],
      completed: [],
      confirmed: [],
      ongoing: [],
      total: 0,
    });
  };

  const filteredClients = clients.filter((client) => {
    const matchesCity = cityFilter === "" || client.lastOrderCity === cityFilter;
    const matchesGender = genderFilter === "" || client.gender === genderFilter;
    return matchesCity && matchesGender;
  });

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Clients</h1>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
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
            <option value="">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
    value={genderFilter}
    onChange={(e) => setGenderFilter(e.target.value)}
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
            <option value="">Gender</option>
            {uniqueGenders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading clients...</p>
        ) : filteredClients.length === 0 ? (
          <p style={{ textAlign: "center" }}>No clients found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {filteredClients.map((client) => (
              <li
                key={client.id}
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
                    <strong>Name:</strong> {client.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {client.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {client.phone || "—"}
                  </p>
                  <p>
                    <strong>City:</strong> {client.lastOrderCity}
                  </p>
                  <p>
                    <strong>Gender:</strong> {client.gender || "—"}
                  </p>
                  <p>
                    <strong>Total Orders:</strong> {client.totalOrders || 0}
                  </p>
                </div>

                <button
                  onClick={() => fetchClientOrders(client.id)}
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

        {/* Modal */}
        {showModal && selectedClient && (
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
              <h2>{selectedClient.name} - Order Details</h2>
              <p>
                <strong>Total Paid:</strong> ₹{clientOrders.total}
              </p>

              {Object.entries(clientOrders).map(([status, orders]) => {
                if (status === "total") return null;
                if (!orders || orders.length === 0) return null;

                const orderCount = orders.length;

                return (
                  <div key={status}>
                    <h3 style={{ marginTop: "15px" }}>
                      {status.charAt(0).toUpperCase() + status.slice(1)} Orders (
                      {orderCount})
                    </h3>
                    <ul>
                      {orders.map((o) => {
                        const amount =
                          status === "cancel by worker" &&
                          o.cancellationReason?.toLowerCase() === "user ask"
                            ? 150
                            : o.total || o.amountPaid || 0;
                        if (amount === 0) return null;

                        const serviceNames =
                          o.items?.map((item) => item.name).join(", ") ||
                          "Service";
                        return (
                          <li key={o.id}>
                            {serviceNames} - ₹{amount}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}

              <button
                onClick={closeModal}
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
