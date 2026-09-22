import { useState, useEffect } from "react";
import NavbarComponent from "../components/Navbar";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");  // Will be fetched
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Fetch user email and name from Firestore on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setEmail(data.email || user.email || "");
            setName(data.name || "");
          } else {
            setEmail(user.email || "");
          }
        } catch (error) {
          console.error("Error fetching user email:", error);
          setEmail("");
        }
      } else {
        setEmail("");
        setName("");
      }
    });

    return unsubscribe;
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    try {
      // Save message data to Firestore 'message' collection
      await addDoc(collection(db, "message"), {
        name,
        email,
        message,
        timestamp: new Date(),
      });

      setSuccess("Message sent successfully!");
      setMessage(""); // clear message input only
    } catch (error) {
      console.error("Error saving message:", error);
      setSuccess("Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <NavbarComponent />
      <Container fluid className="contact-section" style={{ padding: "2rem 1.5rem" }}>
        <h1 style={{ color: "#ffd28f" }}>Contact Us</h1>
        <p>We’d love to hear from you! Fill out the form below to get in touch.</p>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  readOnly
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="formMessage">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            style={{ color: "black", backgroundColor: "#ffd28f", borderColor: "#ffd28f" }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>

          {success && (
            <div
              className="mt-3"
              style={{ color: "#ffd28f", fontWeight: "bold" }}
              role="alert"
            >
              {success}
            </div>
          )}
        </Form>
      </Container>

      {/* Responsive styling for mobile */}
      <style jsx>{`
        @media (max-width: 576px) {
          .contact-section input,
          .contact-section textarea {
            font-size: 14px;
            padding: 0.5rem;
          }

          .contact-section button {
            font-size: 14px;
            padding: 0.5rem 1rem;
          }
        }
      `}</style>
    </>
  );
}
