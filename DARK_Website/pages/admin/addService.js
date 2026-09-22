import React, { useState, useRef, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const CLOUDINARY_UPLOAD_PRESET = "demo_preset";
const CLOUDINARY_CLOUD_NAME = "dsasnjchb";

const subcategories = {
  Makeup: [
    "Party Makeup",
    "Cocktail Makeup",
    "Engagement Makeup",
    "Bridal Makeup",
    "Glam Makeup",
    "Add On",
  ],
  Hairstyle: ["Cut", "Styling", "Coloring", "Extensions", "Treatments"],
  Beauty: ["Facials", "Manicure", "Pedicure", "Waxing"],
};

const AddService = () => {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [original, setOriginal] = useState("");
  const [price, setPrice] = useState("");
  const [time, setTime] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const imageInputRef = useRef(null);

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

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      if (!subcategory) {
        alert("Please select a subcategory.");
        setLoading(false);
        return;
      }
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      } else {
        throw new Error("Please select an image file.");
      }
      await addDoc(collection(db, "services"), {
        createdAt: new Date().toISOString(),
        name,
        details,
        original: Number(original),
        price: Number(price),
        time,
        imageUrl,
        gender,
        category,
        subcategory,
      });
      setSuccess("Service added successfully!");
      setName("");
      setDetails("");
      setOriginal("");
      setPrice("");
      setTime("");
      setImageFile(null);
      setGender("");
      setCategory("");
      setSubcategory("");
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (error) {
      setSuccess("Error adding service: " + error.message);
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
          maxWidth: "520px",
          width: "100%",
          borderRadius: "12px",
          color: "#ffd28f",
        }}
      >
        <h2
          className="mb-4 text-center"
          style={{ color: "#ffd28f", fontWeight: "700" }}
        >
          Add New Service
        </h2>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ textAlign: "left", display: "block" }}
          >
            Service Name
          </label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ textAlign: "left", display: "block" }}
          >
            Details
          </label>
          <textarea
            className="form-control"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
            rows={3}
          />
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ textAlign: "left", display: "block" }}
          >
            Original Price
          </label>
          <input
            type="number"
            className="form-control"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            required
            min="0"
          />
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ textAlign: "left", display: "block" }}
          >
            Offer Price
          </label>
          <input
            type="number"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
          />
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ textAlign: "left", display: "block" }}
          >
            Time
          </label>
          <input
            type="text"
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ textAlign: "left", display: "block" }}
          >
            Select Image
          </label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
            required
            ref={imageInputRef}
          />
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ textAlign: "left", display: "block" }}
          >
            Gender
          </label>
          <select
            className="form-select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="">Select Gender</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            className="form-label"
            style={{ textAlign: "left", display: "block" }}
          >
            Category
          </label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
            }}
            required
          >
            <option value="">Select Category</option>
            <option value="Makeup">Makeup</option>
            <option value="Hairstyle">Hairstyle</option>
            <option value="Beauty">Beauty</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            className="form-label"
            style={{ textAlign: "left", display: "block" }}
          >
            Subcategory
          </label>
          <select
            className="form-select"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            required
            disabled={!category}
          >
            <option value="" disabled>
              {category ? "Select Subcategory" : "Select Category First"}
            </option>
            {category &&
              subcategories[category].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
          style={{ backgroundColor: "#ffd28f", color: "black", border: "none" }}
        >
          {loading ? "Adding..." : "Add Service"}
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

export default AddService;
