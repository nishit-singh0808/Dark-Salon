import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebase";
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

const beautySubcategories = [
  "Facials",
  "Manicure",
  "Pedicure",
  "Waxing",
  "Add On",
];

export default function ServiceListMenBeauty() {
  const [services, setServices] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("Facials");
  const [expandedService, setExpandedService] = useState(null);
  const [cartItemsMap, setCartItemsMap] = useState({}); // serviceId to quantity map
  const [isOverflowing, setIsOverflowing] = useState(false);
  const subserviceBarRef = useRef(null);

  const user = auth.currentUser;
  const router = useRouter();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "services"), (snapshot) => {
      setServices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const el = subserviceBarRef.current;
    if (el) {
      const overflow = el.scrollWidth > el.clientWidth;
      setIsOverflowing(overflow);
      if (overflow) el.scrollLeft = 0;
    }
  }, [selectedSubcategory, services]);

  useEffect(() => {
    if (!user) {
      setCartItemsMap({});
      return;
    }
    const cartItemsRef = collection(db, "carts", user.uid, "items");
    const unsubscribe = onSnapshot(cartItemsRef, (snapshot) => {
      const map = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        map[doc.id] = data.quantity || 0;
      });
      setCartItemsMap(map);
    });
    return () => unsubscribe();
  }, [user]);

  async function incrementCartItem(service) {
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }
    const cartItemRef = doc(db, "carts", user.uid, "items", service.id);
    const cartItemSnap = await getDoc(cartItemRef);
    if (cartItemSnap.exists()) {
      await updateDoc(cartItemRef, {
        quantity: cartItemSnap.data().quantity + 1,
      });
    } else {
      await setDoc(cartItemRef, {
        quantity: 1,
        serviceId: service.id,
        serviceData: {
          name: service.name,
          price: service.price,
          originalPrice: service.originalPrice || null,
          imageUrl: service.imageUrl,
          subCategory: service.subcategory,
          time: service.duration || "",
        },
      });
    }
  }

  async function decrementCartItem(service) {
    if (!user) return;
    const cartItemRef = doc(db, "carts", user.uid, "items", service.id);
    const cartItemSnap = await getDoc(cartItemRef);
    if (!cartItemSnap.exists()) return;
    const currentQty = cartItemSnap.data().quantity;
    if (currentQty <= 1) {
      await deleteDoc(cartItemRef);
    } else {
      await updateDoc(cartItemRef, {
        quantity: currentQty - 1,
      });
    }
  }

  const visibleServices = services.filter(
    (service) =>
      service.subcategory === selectedSubcategory &&
      service.gender === "Men" &&
      service.category === "Beauty"
  );

  const getDiscountPercent = (original, price) => {
    if (!original) return 0; 
    if (price === 0) return 100; 
    if (!price) return 0;
    return Math.round(((original - price) / original) * 100);
  };

  // Calculate total quantity in cart
  const cartItemCount = Object.values(cartItemsMap).reduce(
    (sum, qty) => sum + qty,
    0
  );

  return (
    <div>
      <h1 className="page-title">Beauty Services</h1>

      <div
        className="subservice-bar"
        ref={subserviceBarRef}
        style={{
          justifyContent: isOverflowing ? "flex-start" : "center",
          overflowX: isOverflowing ? "auto" : "visible",
        }}
      >
        {beautySubcategories.map((sub) => (
          <div
            key={sub}
            className={`subservice-item${
              selectedSubcategory === sub ? " active" : ""
            }`}
            onClick={() => setSelectedSubcategory(sub)}
          >
            <img src={`/images/${sub.replace(/\s+/g, "-").toLowerCase()}.jpg`} alt={sub} />
            <div className="subcategory-name">{sub}</div>
          </div>
        ))}
      </div>

      <div className="services-list">
        {visibleServices.length === 0 ? (
          <div className="no-services">No services found.</div>
        ) : (
          visibleServices.map((service) => {
            const quantity = cartItemsMap[service.id] || 0;
            return (
              <div key={service.id} className="service-card-custom">
                <div className="service-time-banner">
                  <div className="time-right">
                    <span role="img" aria-label="timer">
                      ⏳
                    </span>{" "}
                    {service.time || "—"}
                  </div>
                </div>

                <div className="service-card-main">
                  <img
                    className="service-card-img"
                    src={service.imageUrl}
                    alt={service.name}
                  />

                  <div className="service-card-info">
                    <div className="service-card-title">{service.name}</div>

                    <div className="service-card-prices">
                      <span className="service-card-offer-price">₹{service.price}</span>

                      {service.original && (
                        <>
                          <span className="service-card-original-price">
                            ₹{service.original}
                          </span>
                          <span className="service-card-discount">
                            {getDiscountPercent(service.original, service.price)}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="service-desc">
                      {expandedService === service.id ? service.details || "" : ""}
                    </div>

                    <div className="service-info-footer">
                      <button
                        className="service-details-toggle"
                        onClick={() =>
                          setExpandedService(
                            expandedService === service.id ? null : service.id
                          )
                        }
                      >
                        {expandedService === service.id ? "Hide Details" : "View Details"}
                      </button>

                      <div style={{ marginLeft: "auto", order: "2" }}>
                        {quantity === 0 ? (
                          <button
                            className="add-to-cart-btn-custom"
                            onClick={() => incrementCartItem(service)}
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <div className="cart-item-number">
                            <button onClick={() => decrementCartItem(service)}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => incrementCartItem(service)}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fixed Go to Cart button */}
      {cartItemCount > 0 && (
        <button
          className="go-to-cart-btn"
          onClick={() => router.push("/cart")}
          aria-label="Go to cart"
        >
          View Cart ({cartItemCount} {cartItemCount === 1 ? "item" : "items"}) 
        </button>
      )}
    </div>
  );
}
