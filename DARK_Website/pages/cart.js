import { useEffect, useState, useRef } from "react";
import { auth, db } from "../lib/firebase";
import { useRouter } from "next/router";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import NavbarComponent from "../components/Navbar";
import { Container, Table, Button } from "react-bootstrap";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const timeoutRef = useRef(null);
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }

    const cartItemsRef = collection(db, "carts", user.uid, "items");

    const unsubscribe = onSnapshot(cartItemsRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          quantity: data.quantity,
          ...data.serviceData,
          serviceId: data.serviceId,
        };
      });
      setCartItems(items);
    });

    return () => unsubscribe();
  }, [user]);

  // Show success message for 3 seconds when query param is set
  useEffect(() => {
    if (router.query.orderSuccess === "1") {
      setShowSuccess(true);

      // Remove the query param to keep URL clean
      router.replace("/cart", undefined, { shallow: true });
    }
  }, [router.asPath]);

  // Clear the success message after 3 seconds once it is shown
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  async function incrementCartItem(item) {
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }
    const cartItemRef = doc(db, "carts", user.uid, "items", item.id);
    const cartItemSnap = await getDoc(cartItemRef);
    if (cartItemSnap.exists()) {
      await updateDoc(cartItemRef, {
        quantity: cartItemSnap.data().quantity + 1,
      });
    } else {
      await setDoc(cartItemRef, {
        quantity: 1,
        serviceId: item.id,
        serviceData: {
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice || null,
          imageUrl: item.imageUrl,
          subCategory: item.subCategory,
          time: item.time || "",
        },
      });
    }
  }

  async function decrementCartItem(item) {
    if (!user) return;
    const cartItemRef = doc(db, "carts", user.uid, "items", item.id);
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

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleBrowseServices = () => {
    if (router.pathname === "/") {
      const el = document.getElementById("services");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/").then(() => {
        const el = document.getElementById("services");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    }
  };

  const handleProceedCheckout = () => {
    router.push("/checkout");
  };

  return (
    <>
      <NavbarComponent />
      <Container fluid className="cart-section">
        <h1 className="cart-title">My Cart</h1>

        {/* Success message */}
        {showSuccess && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              position: "fixed",
              top: "90px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1002,
              minWidth: "320px",
              maxWidth: "90vw",
              padding: "1rem 2rem",
              borderRadius: "1.2rem",
              background: "rgba(255, 221, 167, 0.75)",
              color: "#111",
              boxShadow: "0 6px 32px rgba(255, 210, 143, 0.36)",
              border: "3px solid #ffd28f",
              fontWeight: 700,
              fontSize: "1.18rem",
              textAlign: "center",
              letterSpacing: "0.03em",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              transition: "opacity 0.5s",
              display: "flex",
              alignItems: "center",
              gap: "0.7em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                fontWeight: "bold",
                fontSize: "1.35em",
                color: "#ffd28f",
                textShadow: "0 0 4px #ffd28f, 0 0 18px #ffe4b3",
              }}
            >
              ✓
            </span>
            <span style={{ color: "#111", filter: "none", fontWeight: 700 }}>
              Order placed successfully!
            </span>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="cart-empty-container" role="alert" aria-live="polite">
            <p className="cart-empty" style={{ fontSize: "xx-large" }}>
              Your cart is empty.
            </p>
            <Button
              variant="warning"
              className="mb-3 btn-gold"
              aria-label="Browse Services"
              onClick={handleBrowseServices}
            >
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <Table responsive bordered hover className="cart-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Service</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>₹{item.price}</td>
                    <td>
                      <div className="cart-item-number">
                        <button
                          onClick={() => decrementCartItem(item)}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => incrementCartItem(item)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>₹{item.price * item.quantity}</td>
                  </tr>
                ))}
                <tr className="cart-total-row">
                  <td colSpan={4} className="text-end fw-bold">
                    Total:
                  </td>
                  <td className="fw-bold">₹{total}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        )}

        {cartItems.length > 0 && (
          <Button
            variant="warning"
            className="btn-gold"
            onClick={handleProceedCheckout}
          >
            Proceed to Checkout
          </Button>
        )}
      </Container>
    </>
  );
}
