import Link from "next/link";
import { Navbar, Nav, Container, Dropdown, Button } from "react-bootstrap";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function NavbarComponent() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profilePic, setProfilePic] = useState("/default-avatar.png");
  const [hasItemsInCart, setHasItemsInCart] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          const data = docSnap.exists() ? docSnap.data() : null;
          setUserData(data);

          if (data?.photo) {
            setProfilePic(data.photo);
          } else if (currentUser.photoURL) {
            setProfilePic(currentUser.photoURL);
          } else {
            setProfilePic("/default-avatar.png");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setProfilePic("/default-avatar.png");
        }
      } else {
        setUser(null);
        setUserData(null);
        setProfilePic("/default-avatar.png");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch cart items from Firestore
  useEffect(() => {
    async function fetchCartStatus() {
      if (!user) {
        setHasItemsInCart(false);
        return;
      }
      try {
        // Assuming your cart doc's ID is the user's UID
        const cartDocRef = doc(db, "carts", user.uid);
        const itemsCollectionRef = collection(cartDocRef, "items");
        const itemsSnapshot = await getDocs(itemsCollectionRef);
        setHasItemsInCart(!itemsSnapshot.empty);
      } catch (error) {
        setHasItemsInCart(false);
      }
    }
    fetchCartStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const displayName = userData?.name || user?.displayName || "User";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navbar-dark bg-black">
      <Container fluid className="px-0"> 
        <Navbar.Brand href="/">
          <Image src="/images/small-logo.jpg" alt="DarkSite Logo" width={180} height={80} />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto me-0">
            <Nav.Link as={Link} href="/">HOME</Nav.Link>
            <Nav.Link as={Link} href="/about">ABOUT US</Nav.Link>
            <Nav.Link as={Link} href="/#services">SERVICES</Nav.Link>
            <Nav.Link as={Link} href="/#reviews">REVIEWS</Nav.Link>
            <Nav.Link as={Link} href="/contact">CONTACT</Nav.Link>
            <Nav.Link as={Link} href="/apply-as-professional">APPLY AS PROFESSIONAL</Nav.Link>
            <Nav.Link as={Link} href="/cart" style={{ position: "relative" }}>
              <FaShoppingCart />
              {" "}CART
              {hasItemsInCart && (
                <span
                  style={{
                    position: "absolute",
                    top: "7px",
                    right: "1px",
                    width: "10px",
                    height: "10px",
                    backgroundColor: "red",
                    borderRadius: "50%",
                    zIndex: 1000,
                  }}
                />
              )}
            </Nav.Link>
            <Nav.Link as={Link} href="/bookings">BOOKINGS</Nav.Link>
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                id="dropdown-profile"
                className="text-white d-flex align-items-center gap-2 no-underline"
              >
                <FaUser />
                <span>{user ? displayName : "Login / Sign Up"}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ minWidth: "220px", padding: "10px",backgroundColor:"rgba(0, 0, 0, 0.5)" }}>
                {user ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px",
                        borderBottom: "1px solid #ddd",
                        marginBottom: "10px",
                      }}
                    >
                      <Image
                        src={profilePic}
                        alt={`${displayName} profile`}
                        width={40}
                        height={40}
                        style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #ccc" }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", fontSize: "14px", color:"white"}}>
                        <strong>{displayName}</strong>
                        <span>{userData?.phone || "+91 XXXXX XXXXX"}</span>
                      </div>
                    </div>
                    <Dropdown.Item as={Link} href="/editProfile" passHref style={{color:"white", backgroundColor:"rgba(0, 0, 0, 0.0)"}}>
                      Edit Profile
                    </Dropdown.Item>
                    <Dropdown.Item
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{color:"white", backgroundColor:"rgba(0, 0, 0, 0.0)"}}
                    >
                      Help & Support
                    </Dropdown.Item>
                    <Dropdown.Divider style={{ borderColor: "white" }} />
                    <Dropdown.Item style={{ color: "red", backgroundColor:"rgba(0, 0, 0, 0.0)" }} onClick={handleLogout}>
                      Logout
                    </Dropdown.Item>
                  </>
                ) : (
                  <Dropdown.Item as={Link} href="/login" passHref style={{backgroundColor:"rgba(0, 0, 0, 0.5)"}}>
                    <Button variant="dark" className="w-100" style={{ color: "black",backgroundColor:"#ffd28f" }}>
                      Login / Sign Up
                    </Button>
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
