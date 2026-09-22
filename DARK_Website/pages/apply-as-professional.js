import React, { useState, useRef, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const CLOUDINARY_UPLOAD_PRESET = "demo_preset";
const CLOUDINARY_CLOUD_NAME = "dsasnjchb";

const ApplyJob = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [experience, setExperience] = useState("");
  const [lastSalary, setLastSalary] = useState("");
  const [lastCompany, setLastCompany] = useState("");
  const [expertise, setExpertise] = useState("");
  const [email, setEmail] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [aadhaarImageFile, setAadhaarImageFile] = useState(null);
  const [panImageFile, setPanImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const aadhaarInputRef = useRef(null);
  const panInputRef = useRef(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );
    const json = await res.json();
    if (json.secure_url) {
      return json.secure_url;
    } else {
      throw new Error("Image upload failed");
    }
  };

  const handleAadhaarChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAadhaarImageFile(e.target.files[0]);
    }
  };

  const handlePanChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPanImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      if (!aadhaarImageFile || !panImageFile) {
        alert("Please upload both Aadhaar and PAN images.");
        setLoading(false);
        return;
      }

      const aadhaarImageUrl = await uploadImageToCloudinary(aadhaarImageFile);
      const panImageUrl = await uploadImageToCloudinary(panImageFile);

      await addDoc(collection(db, "applications"), {
        createdAt: serverTimestamp(),
        name,
        age: Number(age),
        maritalStatus,
        experience: Number(experience),
        lastSalary: Number(lastSalary),
        lastCompany,
        expertise,
        email,
        phone1,
        phone2,
        aadhaarImageUrl,
        panImageUrl,
      });

      setSuccess("Application submitted successfully!");
      // Reset form fields
      setName("");
      setAge("");
      setMaritalStatus("");
      setExperience("");
      setLastSalary("");
      setLastCompany("");
      setExpertise("");
      setEmail("");
      setPhone1("");
      setPhone2("");
      setAadhaarImageFile(null);
      setPanImageFile(null);
      if (aadhaarInputRef.current) aadhaarInputRef.current.value = "";
      if (panInputRef.current) panInputRef.current.value = "";
    } catch (error) {
      setSuccess("Error submitting application: " + error.message);
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "black", padding: "20px" }}
    >
      <form
        className="card p-4 shadow"
        onSubmit={handleSubmit}
        style={{
          maxWidth: "600px",
          width: "100%",
          borderRadius: "12px",
          color: "#ffd28f",
        }}
      >
        <h2
          className="mb-4 text-center"
          style={{ color: "#ffd28f", fontWeight: "700" }}
        >
          Apply as Professional
        </h2>

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Age</label>
          <input
            type="number"
            className="form-control"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            min="18"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Marital Status</label>
          <select
            className="form-select"
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            required
          >
            <option value="">Select Marital Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Experience (Years)</label>
          <input
            type="number"
            className="form-control"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            required
            min="0"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Last Salary</label>
          <input
            type="number"
            className="form-control"
            value={lastSalary}
            onChange={(e) => setLastSalary(e.target.value)}
            required
            min="0"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Last Work Company</label>
          <input
            type="text"
            className="form-control"
            value={lastCompany}
            onChange={(e) => setLastCompany(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Expertise</label>
          <input
            type="text"
            className="form-control"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
  <label className="form-label">Phone Number 1</label>
  <input
    type="tel"
    className="form-control"
    value={phone1}
    onChange={(e) => setPhone1(e.target.value)}
    required
    pattern="[0-9]{10}"
    maxLength="10"
    length="10"
    title="Phone number must be 10 digits"
  />
</div>

<div className="mb-3">
  <label className="form-label">Phone Number 2</label>
  <input
    type="tel"
    className="form-control"
    value={phone2}
    onChange={(e) => setPhone2(e.target.value)}
    pattern="[0-9]{10}"
    maxLength="10"
    length="10"
    title="Phone number must be 10 digits"
  />
</div>


        <div className="mb-3">
          <label className="form-label">Upload Aadhaar Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleAadhaarChange}
            required
            ref={aadhaarInputRef}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Upload PAN Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handlePanChange}
            required
            ref={panInputRef}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
          style={{ backgroundColor: "#ffd28f", color: "black", border: "none" }}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>

        {success && (
          <div className="alert alert-info mt-3 text-center" role="alert">
            {success}
          </div>
        )}
      </form>
    </div>
  );
};

export default ApplyJob;
