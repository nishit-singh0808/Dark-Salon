import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [days, setDays] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const adminEmail = "singhnishit786@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Admin check
        if (user.email === adminEmail) {
          router.replace("/admin/dashboard");
          return;
        }

        // Worker check
        const workersRef = collection(db, "workers");
        const q = query(workersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          router.replace("/worker-dashboard");
          return;
        }

        // Normal user - show signup form
        setEmail(user.email);
        setUid(user.uid);
        setLoading(false);
      } else {
        // No user logged in → redirect to login
        router.push("/login");
      }
    });

    // Populate days and years for DOB
    setDays(Array.from({ length: 31 }, (_, i) => i + 1));
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear - 18;
    setYears(Array.from({ length: 100 }, (_, i) => maxYear - i));

    return () => unsubscribe();
  }, [router]);

  const handleSignup = async () => {
    if (!name || !gender || !maritalStatus || !phone || !day || !month || !year) {
      alert("Please fill all fields.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const dob = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 18) {
      alert("You must be at least 18 years old to sign up.");
      return;
    }

    try {
      await setDoc(doc(db, "users", uid), {
        name,
        gender,
        maritalStatus,
        phone,
        dob: `${year}-${month}-${day}`,
        email,
        createdAt: new Date().toISOString(),
      });

      localStorage.removeItem("uid");
      localStorage.removeItem("email");

      router.push("/"); // redirect normal user
    } catch (error) {
      console.error("Signup Error", error);
      alert("Signup failed. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>; // prevent flashing signup form

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h2>Complete Signup</h2>

        <label htmlFor="name">Full Name</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />

        <label htmlFor="gender">Gender</label>
        <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="" disabled>Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="maritalStatus">Marital Status</label>
        <select id="maritalStatus" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
          <option value="" disabled>Select Marital Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={10}
          minLength={10}
          pattern="^\d{10}$"
        />

        <label>Date of Birth</label>
        <div style={{ display: "flex", gap: "10px" }}>
          <select id="dob-day" value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="" disabled>Day</option>
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select id="dob-month" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="" disabled>Month</option>
            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
          </select>

          <select id="dob-year" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="" disabled>Year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={email} readOnly />

        <button onClick={handleSignup}>Complete Signup</button>
      </div>
    </div>
  );
}
