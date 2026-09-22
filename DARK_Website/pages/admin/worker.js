"use client";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import AdminNavbar from "./admin-navbar";
import { collection, getDocs, updateDoc, doc, setDoc, query, where, deleteDoc } from "firebase/firestore";

export default function WorkerManagement() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "workers"));
      const workersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWorkers(workersData);
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (worker) => {
    const newStatus = worker.status === "active" ? "inactive" : "active";
    try {
      await updateDoc(doc(db, "workers", worker.id), { status: newStatus });
      setWorkers((prev) =>
        prev.map((w) => (w.id === worker.id ? { ...w, status: newStatus } : w))
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAddWorker = async () => {
    if (!email) {
      alert("Please enter a user email.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("No user found with this email.");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      await setDoc(doc(db, "workers", userDoc.id), {
        ...userData,
        status: "free",
        createdAt: new Date().toISOString(),
      });

      setEmail("");
      fetchWorkers();
      alert("User promoted to worker successfully!");
    } catch (error) {
      console.error("Failed to add worker:", error);
      alert("Error adding worker. Try again.");
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!confirm("Are you sure you want to delete this worker?")) return;

    try {
      await deleteDoc(doc(db, "workers", workerId));
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
      alert("Worker deleted successfully!");
    } catch (error) {
      console.error("Failed to delete worker:", error);
      alert("Error deleting worker. Try again.");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mt-5">
        <h2>Worker Management</h2>

        {/* Add Worker */}
        <div className="card p-3 mb-4" style={{
            width: "90%",
            borderRadius:"10px",
            margin: "0 auto",
            boxShadow: "none",
            backgroundColor:"black",
            border: "2px solid #ffd28f",
        }}>
          <h5>Add Worker</h5>
          <div className="row g-2" style={{display:"flex", justifyContent:"center", alignItems:"center", gap:"20px"}}>
            <div className="col-md-8">
              <input
                type="email"
                placeholder="Enter user email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-4" style={{maxWidth:"150px"}}>
              <button
                className="btn w-100"
                style={{backgroundColor:"#ffd28f",borderColor:"#ffd28f",color:"black"}}
                onClick={handleAddWorker}
              >
                Add Worker
              </button>
            </div>
          </div>
        </div>

        {/* Worker List */}
        {loading ? (
          <p>Loading workers...</p>
        ) : workers.length === 0 ? (
          <p>No workers found.</p>
        ) : (
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Busy/Free</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id}>
                  <td>{worker.name}</td>
                  <td>{worker.email}</td>
                  <td>{worker.phone}</td>
                  <td>{worker.city || "Not Provided"}</td>
                  <td>{worker.status}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteWorker(worker.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
