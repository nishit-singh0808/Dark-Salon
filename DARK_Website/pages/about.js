// pages/about.js
import NavbarComponent from "../components/Navbar";

export default function About() {
  return (
    <>
      <NavbarComponent />
      <div style={{ padding: "2rem" }}>
        <h1 style={{color: "#ffd28f" }}>About Us</h1>
        <p>
          Welcome to DARK Salon! We specialize in enhancing your natural beauty with expert care, personalized treatments, and a touch of luxury. Our team of professionals is dedicated to making every visit a memorable experience.
        </p>
      </div>
    </>
  );
}
