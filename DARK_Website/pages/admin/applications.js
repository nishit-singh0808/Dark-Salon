"use client";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import AdminNavbar from "./admin-navbar";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const apps = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ✅ Delete application
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this application?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "applications", id));
      setApplications(applications.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Job Applications</h1>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p style={{ textAlign: "center" }}>No applications found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {applications.map((app) => (
              <li
                key={app.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "15px",
                  background: "black",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p><strong>Name:</strong> {app.name || "—"}</p>
                  <p><strong>Age:</strong> {app.age || "—"}</p>
                  <p><strong>Marital Status:</strong> {app.maritalStatus || "—"}</p>
                  <p><strong>Experience:</strong> {app.experience ? `${app.experience} yrs` : "—"}</p>
                  <p><strong>Last Salary:</strong> {app.lastSalary || "—"}</p>
                  <p><strong>Last Company:</strong> {app.lastCompany || "—"}</p>
                  <p><strong>Expertise:</strong> {app.expertise || "—"}</p>
                  <p><strong>Email:</strong> {app.email || "—"}</p>
                  <p><strong>Phone No:</strong> {app.phone1 || "—"}</p>
                  <p><strong>Alternate Phone No:</strong> {app.phone2 || "—"}</p>
                  <p>
                    <strong>Aadhaar:</strong>{" "}
                    {app.aadhaarImageUrl ? (
                      <a href={app.aadhaarImageUrl} target="_blank" rel="noreferrer" style={{ color: "#ffd28f" }}>
                        View
                      </a>
                    ) : "—"}
                  </p>
                  <p>
                    <strong>PAN:</strong>{" "}
                    {app.panImageUrl ? (
                      <a href={app.panImageUrl} target="_blank" rel="noreferrer" style={{ color: "#ffd28f" }}>
                        View
                      </a>
                    ) : "—"}
                  </p>
                  <p>
                    <strong>Applied At:</strong>{" "}
                    {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleString() : "—"}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(app.id)}
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
