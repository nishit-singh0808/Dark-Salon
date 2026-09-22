"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase"; // make sure auth is imported
import AdminNavbar from "./admin-navbar";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [clientOrderCount, setClientOrderCount] = useState({});
  const [lastOrderCity, setLastOrderCity] = useState({});

  const adminEmail = "singhnishit786@gmail.com"; // your admin email

  // ✅ Check admin login on page load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== adminEmail) {
        router.push("/login"); // redirect non-admin or logged out users
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, []);

  // Fetch Users
  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch Orders
  const fetchOrders = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setOrders(ordersData);

    const validStatuses = [
      "completed",
      "ongoing",
      "cancel by worker(reason: user ask)",
    ];
    const validOrders = ordersData.filter((o) => validStatuses.includes(o.status));

    const counts = {};
    const lastCities = {};

    validOrders.forEach((o) => {
      if (!counts[o.userId]) counts[o.userId] = 0;
      counts[o.userId]++;

      const createdAt = o.createdAt?.toDate ? o.createdAt.toDate() : null;
      if (createdAt) {
        if (!lastCities[o.userId] || createdAt > lastCities[o.userId].createdAt) {
          lastCities[o.userId] = {
            city: o.userInfo?.city || "Not Provided",
            createdAt,
          };
        }
      }
    });

    setClientOrderCount(counts);
    setLastOrderCity(
      Object.fromEntries(
        Object.entries(lastCities).map(([uid, data]) => [uid, data.city])
      )
    );
  };

  const filteredClients = users.filter((u) => {
    return (
      (cityFilter ? lastOrderCity[u.id] === cityFilter : true) &&
      (genderFilter ? u.gender === genderFilter : true)
    );
  });

  const repeatedClients = filteredClients.filter((u) => clientOrderCount[u.id] > 1);

  const validStatuses = [
    "completed",
    "ongoing",
    "cancel by worker(reason: user ask)",
  ];
  const validOrders = orders.filter((o) => validStatuses.includes(o.status));
  const now = new Date();
  const income = {
    weekly: validOrders
      .filter(
        (o) =>
          o.createdAt?.toDate &&
          o.createdAt.toDate().getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000
      )
      .reduce((sum, o) => sum + (o.total || 0), 0),
    monthly: validOrders
      .filter(
        (o) =>
          o.createdAt?.toDate &&
          o.createdAt.toDate().getTime() > now.getTime() - 30 * 24 * 60 * 60 * 1000
      )
      .reduce((sum, o) => sum + (o.total || 0), 0),
    yearly: validOrders
      .filter(
        (o) =>
          o.createdAt?.toDate &&
          o.createdAt.toDate().getTime() > now.getTime() - 365 * 24 * 60 * 60 * 1000
      )
      .reduce((sum, o) => sum + (o.total || 0), 0),
    total: validOrders.reduce((sum, o) => sum + (o.total || 0), 0),
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mt-5">
        <h2>Admin Dashboard</h2>

        {/* Stats */}
        <div className="row">
          <div className="col-12 col-sm-6 col-md-3 mb-3">
            <div className="card p-3 shadow-sm h-100">
              <h5>Total Clients</h5>
              <h3>{filteredClients.length}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3 mb-3">
            <div className="card p-3 shadow-sm h-100">
              <h5>Weekly Income</h5>
              <h3>₹{income.weekly}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3 mb-3">
            <div className="card p-3 shadow-sm h-100">
              <h5>Monthly Income</h5>
              <h3>₹{income.monthly}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3 mb-3">
            <div className="card p-3 shadow-sm h-100">
              <h5>Yearly Income</h5>
              <h3>₹{income.yearly}</h3>
            </div>
          </div>
        </div>

        {/* Repeated Clients */}
        <div className="mt-4">
          <h4>Repeated Clients</h4>

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-3">
              <select
                className="form-control"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="">All Cities</option>
                {[...new Set(Object.values(lastOrderCity))].map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-control"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <ul className="list-group">
            {repeatedClients.map((u) => (
              <li
                key={u.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{u.name}</strong> <br />
                  {u.gender} | {lastOrderCity[u.id] || "Not Provided"}
                </div>
                <span className="badge bg-primary rounded-pill">
                  {clientOrderCount[u.id]} times
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
