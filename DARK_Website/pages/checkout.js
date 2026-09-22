import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  writeBatch,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/router";

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const cityCenters = {
  Gurugram: { lat: 28.4595, lon: 77.0266 },
  Delhi: { lat: 28.6139, lon: 77.209 },
  "Greater Noida": { lat: 28.4744, lon: 77.504 },
};

export default function Checkout() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
  });
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [travelCharge, setTravelCharge] = useState(80);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  const router = useRouter();
  const user = auth.currentUser;

  const cityOptions = ["Gurugram", "Delhi", "Greater Noida"];

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);

        let fetchedUserInfo = null;
        if (!snapshot.empty) {
          const lastOrder = snapshot.docs[0].data();
          if (lastOrder.userInfo) {
            fetchedUserInfo = lastOrder.userInfo;
          }
        }

        if (!fetchedUserInfo?.phone || !fetchedUserInfo?.name) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userProfile = userDocSnap.data();
            fetchedUserInfo = {
              ...fetchedUserInfo,
              phone: fetchedUserInfo?.phone || userProfile.phone || "",
              name: fetchedUserInfo?.name || userProfile.name || "",
              address:
                fetchedUserInfo?.address ||
                [
                  fetchedUserInfo?.houseNo,
                  fetchedUserInfo?.location,
                  fetchedUserInfo?.landmark,
                  userProfile.houseNo,
                  userProfile.location,
                  userProfile.landmark,
                ]
                  .filter(Boolean)
                  .join(", ") || "",
              pincode: fetchedUserInfo?.pincode || userProfile.pincode || "",
              city: fetchedUserInfo?.city || userProfile.city || "",
            };
          }
        }

        const sanitizedPhone = fetchedUserInfo?.phone
          ? fetchedUserInfo.phone.replace(/\D/g, "").slice(-10)
          : "";

        setUserInfo({
          name: fetchedUserInfo?.name || user.displayName || "",
          phone: sanitizedPhone,
          address: fetchedUserInfo?.address || "",
          pincode: fetchedUserInfo?.pincode || "",
          city: fetchedUserInfo?.city || "",
        });

        const cartRef = collection(db, "carts", user.uid, "items");
        const cartSnap = await getDocs(cartRef);
        const items = cartSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data().serviceData,
          quantity: doc.data().quantity,
        }));
        setCartItems(items);
        setTotal(items.reduce((acc, i) => acc + i.price * i.quantity, 0));
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, router]);

  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      let sanitizedValue = value.replace(/\D/g, "");
      if (sanitizedValue.length > 10) sanitizedValue = sanitizedValue.slice(0, 10);
      setUserInfo((prev) => ({ ...prev, [name]: sanitizedValue }));

      if (!validatePhone(sanitizedValue)) {
        setPhoneError("Enter a valid 10-digit phone number");
      } else {
        setPhoneError("");
      }
      return;
    }

    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!userLocation) {
      setTravelCharge(80);
      return;
    }
    const cityCenter = cityCenters[userInfo.city];
    if (!cityCenter) {
      setTravelCharge(80);
      return;
    }
    const distance = getDistanceFromLatLonInKm(
      userLocation.lat,
      userLocation.lon,
      cityCenter.lat,
      cityCenter.lon
    );
    if (distance <= 5) setTravelCharge(50);
    else if (distance <= 7) setTravelCharge(60);
    else if (distance <= 10) setTravelCharge(70);
    else if (distance <= 15) setTravelCharge(80);
    else if (distance <= 17) setTravelCharge(90);
    else setTravelCharge(100);
  }, [userLocation, userInfo.city]);

  const isValid = () =>
    userInfo.name.trim() &&
    userInfo.phone.trim() &&
    !phoneError &&
    userInfo.address.trim() &&
    userInfo.pincode.trim() &&
    userInfo.city.trim();

  const handlePlace = async () => {
    if (!user) return;
    if (!isValid()) {
      setError("Please fill all required fields correctly.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setError(null);
    setPlacing(true);

    const orderData = {
      userId: user.uid,
      userInfo,
      items: cartItems.map((i) => ({
        serviceId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      total: total + travelCharge,
      travelCharge,
      userLocationLink: userLocation
        ? `https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lon}`
        : null,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      const batch = writeBatch(db);
      cartItems.forEach((i) => {
        const ref = doc(db, "carts", user.uid, "items", i.id);
        batch.delete(ref);
      });
      await batch.commit();
      router.push("/cart?orderSuccess=1");
    } catch (err) {
      console.error("❌ Order placement failed:", err);
      setError("Failed to place order, please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocationMessage("Current location fetched successfully!");
        setTimeout(() => setLocationMessage(""), 5000);
      },
      (error) => {
        alert("Could not get your location: " + error.message);
        setTravelCharge(80);
        setLocationMessage("");
      }
    );
  };

  if (loading) return <div className="order-checkout-loading">Loading...</div>;

  return (
    <div className="order-checkout-outer">
      <h2 className="order-checkout-title">Checkout</h2>
      <div className="order-checkout-form-card">
        <form className="order-checkout-form" onSubmit={(e) => e.preventDefault()}>
          <h3 className="order-checkout-form-heading">Contact &amp; Address Information</h3>

          {/* Row 1: Name + Phone */}
          <div className="order-checkout-grid-row">
            <div className="order-checkout-field">
              <label htmlFor="name">Name<span className="order-checkout-required">*</span></label>
              <input id="name" name="name" value={userInfo.name} onChange={handleChange} required type="text" />
            </div>
            <div className="order-checkout-field">
              <label htmlFor="phone">Phone Number<span className="order-checkout-required">*</span></label>
              <input id="phone" name="phone" value={userInfo.phone} onChange={handleChange} required type="text" maxLength={10} minLength={10} pattern="^\d{10}$" inputMode="numeric"/>
              {phoneError && <p className="order-checkout-error">{phoneError}</p>}
            </div>
          </div>

          {/* Row 2: Address (full width) */}
          <div className="order-checkout-full-row">
            <div className="order-checkout-field">
              <label htmlFor="address">Address<span className="order-checkout-required">*</span></label>
              <textarea id="address" name="address" value={userInfo.address} onChange={handleChange} required rows={3}/>
            </div>
          </div>

          {/* Row 3: Pincode + City */}
          <div className="order-checkout-grid-row">
            <div className="order-checkout-field">
              <label htmlFor="pincode">Pincode<span className="order-checkout-required">*</span></label>
              <input id="pincode" name="pincode" value={userInfo.pincode} onChange={handleChange} required type="text"/>
            </div>
            <div className="order-checkout-field">
              <label htmlFor="city">City<span className="order-checkout-required">*</span></label>
              <select id="city" name="city" value={userInfo.city} onChange={handleChange} required>
                <option value="">Select city</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Current Location */}
          <div className="order-checkout-full-row">
            <div className="order-checkout-location-row">
              <span className="order-checkout-location-text">For faster service, share your current location.</span>
              <button type="button" onClick={useCurrentLocation} className="order-checkout-location-button">📍Use Current Location</button>
            </div>
          </div>
          {locationMessage && (
            <p style={{ color: "#ffd28f", marginTop: "0.5rem" }}>{locationMessage}</p>
          )}

          {/* Order Summary */}
          <h3 className="order-checkout-form-heading">Order Summary</h3>
          <ul className="order-checkout-summary">
            {cartItems.map((i) => (
              <li key={i.id}>{i.name} x {i.quantity} = <strong>₹{i.price * i.quantity}</strong></li>
            ))}
          </ul>

          <h4 className="order-checkout-total">Total: ₹{total} + Travel Charge: ₹{travelCharge} = ₹{total + travelCharge}</h4>

          {error && <p className="order-checkout-error">{error}</p>}

          <button type="button" onClick={handlePlace} disabled={placing || !isValid() || cartItems.length === 0} className="order-checkout-button">
            {placing ? "Placing..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
