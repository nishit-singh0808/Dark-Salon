import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [name, setName] = useState("");
  const [dob, setDob] = useState({ day: "", month: "", year: "" });
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 18;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/"); // if not logged in -> go home
      } else {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          if (data.dob) {
            const [year, month, day] = data.dob.split("-");
            setDob({ day, month, year });
          }
          setGender(data.gender || "");
          setMaritalStatus(data.maritalStatus || "");
          setPhone(data.phone || "");
          setPhoto(data.photo || "");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (
      !name.trim() ||
      !dob.day ||
      !dob.month ||
      !dob.year ||
      !gender ||
      !maritalStatus ||
      !phone.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Age validation
    const birthDate = new Date(dob.year, dob.month - 1, dob.day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      alert("You must be at least 18 years old.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name,
        dob: `${dob.year}-${dob.month}-${dob.day}`,
        gender,
        maritalStatus,
        phone,
        photo,
      });
      alert("Profile updated successfully!");
      router.push("/"); // Redirect to home
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert("Something went wrong while updating!");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h2>Edit Profile</h2>

        {/* Profile photo */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              margin: "0 auto",
              border: "3px solid #ccc",
            }}
          >
            <img
              src={photo || "/default-avatar.png"}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Edit photo button */}
          <div style={{ marginTop: "10px" }}>
            <label
              htmlFor="fileUpload"
              style={{
                backgroundColor: "#ffd28f",
                color: "black",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              Edit Photo
            </label>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPhoto(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* DOB */}
          <div className="form-group">
            <label>Date of Birth</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <select
                value={dob.day}
                onChange={(e) => setDob({ ...dob, day: e.target.value })}
                aria-label="Day"
                required
              >
                <option value="" disabled>
                  Day
                </option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={dob.month}
                onChange={(e) => setDob({ ...dob, month: e.target.value })}
                aria-label="Month"
                required
              >
                <option value="" disabled>
                  Month
                </option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={dob.year}
                onChange={(e) => setDob({ ...dob, year: e.target.value })}
                aria-label="Year"
                required
              >
                <option value="" disabled>
                  Year
                </option>
                {Array.from({ length: 100 }, (_, i) => currentYear - i).map(
                  (year) =>
                    year <= maxYear && year >= minYear ? (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ) : null
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="maritalStatus">Marital Status</label>
            <select
              id="maritalStatus"
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
              minLength={10}
              pattern="^\d{10}$"
              required
            />
          </div>

          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}
