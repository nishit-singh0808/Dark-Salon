import AdminNavbar from './admin-navbar';
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase"; // adjust your Firebase import path
import Link from "next/link";
import { doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function ServingAndPricing() {
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ gender: "", category: "", subcategory: "" });
  const router = useRouter();
  const [allServices, setAllServices] = useState([]);

  function handleEdit(service) {
  // navigate to edit page or show modal
  router.push(`/admin/editService/${service.id}`); // ensure service.id exists
}

async function handleDelete(service) {
  if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return;
  try {
    const serviceDocRef = doc(db, "services", service.id);
    await deleteDoc(serviceDocRef);
    setServices(prev => prev.filter(s => s.id !== service.id));
  } catch (error) {
    console.error("Failed to delete service", error);
  }
}
  // Data fetch with filters
useEffect(() => {
  async function fetchServices() {
    let q = collection(db, "services");
    let conditions = [];
    if (filters.gender) conditions.push(where("gender", "==", filters.gender));
    if (filters.category) conditions.push(where("category", "==", filters.category));
    if (filters.subcategory) conditions.push(where("subcategory", "==", filters.subcategory));
    if (conditions.length > 0) q = query(q, ...conditions);

    const snapshot = await getDocs(q);
    setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));  // Add id here
  }
  fetchServices();
}, [filters]);


useEffect(() => {
  async function fetchAll() {
    const snapshot = await getDocs(collection(db, "services"));
    setAllServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));  // Add id here
  }
  fetchAll();
}, []);

  const genders = [...new Set(allServices.map(s => s.gender))];
  const categories = [...new Set(allServices.map(s => s.category))];
  const subcategories = [...new Set(allServices.map(s => s.subcategory))];

  return (
    <>
    <AdminNavbar />
    <div className="admin-serving-pricing-container">
      <div className="admin-serving-pricing-header">
        <div className="admin-serving-pricing-filters">
          <select
            className="admin-serving-pricing-filter"
            value={filters.gender}
            onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
          >
            <option value="">Gender</option>
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            className="admin-serving-pricing-filter"
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">Category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="admin-serving-pricing-filter"
            value={filters.subcategory}
            onChange={e => setFilters(f => ({ ...f, subcategory: e.target.value }))}
          >
            <option value="">Subcategory</option>
            {subcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
          </select>
        </div>
        <div className="admin-serving-pricing-actions">
          <Link href="/admin/addService">
            <button className="admin-serving-pricing-add-btn">
              + Add Services
            </button>
          </Link>
        </div>
      </div>

      <div className="admin-serving-pricing-table-container">
        <table className="admin-serving-pricing-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Details</th>
              <th>Original Price</th>
              <th>Price</th>
              <th>Time</th>
            </tr>
          </thead>
         <tbody>
            {services.map((service, idx) => (
                <tr key={idx}>
                <td><img src={service.imageUrl} alt={service.name} style={{ width: 50 }} /></td>
                <td>{service.name}</td>
                <td>{service.details}</td>
                <td>{service.original}</td>
                <td>{service.price}</td>
                <td>{service.time}</td>
                <td>
                    <button
                    className="admin-serving-pricing-edit-btn"
                    onClick={() => handleEdit(service)}
                    >
                    Edit
                    </button>
                </td>
                <td>
                    <button
                    className="admin-serving-pricing-delete-btn"
                    onClick={() => handleDelete(service)}
                    >
                    Delete
                    </button>
                </td>
                </tr>
            ))}
        </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
