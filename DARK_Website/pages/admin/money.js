"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import AdminNavbar from "./admin-navbar";

export default function AdminMoney() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all workers from Firestore
  const fetchWorkers = async () => {
    const workersRef = collection(db, "workers");
    const snapshot = await getDocs(workersRef);
    const workersData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setWorkers(workersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Handle input change
  const handleChange = (id, field, value) => {
    setWorkers(prev =>
      prev.map(worker =>
        worker.id === id ? { ...worker, [field]: value } : worker
      )
    );
  };

  // Handle update to Firestore
  const handleUpdate = async (worker) => {
    const workerRef = doc(db, "workers", worker.id);
    await updateDoc(workerRef, {
      qrAmount: Number(worker.qrAmount || 0),
      cashAmount: Number(worker.cashAmount || 0),
    });
    alert(`Updated ${worker.name}`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
    <AdminNavbar />
    <div style={{ padding: "20px" }}>
      <h1>Admin - Worker Money Management</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid black" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Phone</th>
            <th style={{ padding: "10px", textAlign: "left" }}>QR Amount</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Cash Amount</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {workers.map(worker => (
            <tr key={worker.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: "10px" }}>{worker.name}</td>
              <td style={{ padding: "10px" }}>{worker.phone}</td>
              <td style={{ padding: "10px" }}>
                <input
                  type="number"
                  value={worker.qrAmount || 0}
                  onChange={(e) => handleChange(worker.id, "qrAmount", e.target.value)}
                  style={{ padding: "6px", width: "100px" }}
                />
              </td>
              <td style={{ padding: "10px" }}>
                <input
                  type="number"
                  value={worker.cashAmount || 0}
                  onChange={(e) => handleChange(worker.id, "cashAmount", e.target.value)}
                  style={{ padding: "6px", width: "100px" }}
                />
              </td>
              <td style={{ padding: "10px" }}>
                <button
                  onClick={() => handleUpdate(worker)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
