import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebase"; // Firebase auth
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import NavbarComponent from "../components/Navbar";
import { Container } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import Reviews from "../components/Reviews";

export default function Home() {
  const [selected, setSelected] = useState("women");
  const [user, setUser] = useState(null); // Track Firebase logged-in user
  const router = useRouter();
  const adminEmail = "singhnishit786@gmail.com";

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Admin redirect
        if (currentUser.email === adminEmail) {
          router.replace("/admin/dashboard");
          return;
        }

        // Worker redirect
        const workersRef = collection(db, "workers");
        const q = query(workersRef, where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          router.replace("/worker-dashboard");
          return;
        }

        // Normal user - stay on home
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLoginClick = () => {
    router.push("/login");
  };

  const services = {
    women: [
      { title: "Makeup", img: "/images/women-makeup.avif" },
      { title: "Hairstyle", img: "/images/women-hairstyle.jpg" },
      { title: "Beauty", img: "/images/women-beauty.jpg" },
    ],
    men: [
      { title: "Makeup", img: "/images/men-makeup.jpg" },
      { title: "Hairstyle", img: "/images/men-hairstyle.jpg" },
      { title: "Beauty", img: "/images/men-beauty.jpg" },
    ],
  };

  return (
    <>
      <Head>
        <title>DarkSite</title>
        <link rel="icon" href="/images/small-logo.jpg" type="image/jpeg" />
      </Head>

      <NavbarComponent />

      {/* Swiper Image Slider */}
      <div className="swiper-container" aria-label="Image slider" style={{ position: "relative" }}>
        <Swiper
          spaceBetween={30}
          pagination={{ clickable: true }}
          navigation={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          modules={[Navigation, Pagination, Autoplay]}
          loop={true}
          speed={3000}
          effect="slide"
        >
          {[1, 2, 3].map((num) => (
            <SwiperSlide key={num}>
              <Image
                src={`/images/slide${num}.${num === 2 ? "avif" : num === 3 ? "jpg" : "png"}`}
                alt={`Slide ${num}`}
                width={1920}
                height={1080}
                priority={num === 1}
                style={{ borderRadius: "30px", objectFit: "cover", height: "83vh", width: "100%" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Overlay for login if user not logged in */}
        {!user && (
          <div
            role="region"
            aria-live="polite"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              textAlign: "center",
              zIndex: 10,
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "1.5rem 2rem",
              borderRadius: "12px",
              userSelect: "none",
              maxWidth: "90%",
            }}
          >
            <h2>Welcome to DARK Salon</h2>
            <button
              onClick={handleLoginClick}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1.3rem",
                fontSize: "1.4rem",
                backgroundColor: "#ffd28f",
                color: "black",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              aria-label="Login to your account"
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Segmented Button Below Swiper */}
      <div
        id="services"
        className="services-section"
        style={{ scrollMarginTop: "100px" }}
        role="tablist"
        aria-label="Service category toggle"
      >
        <h2 className="services-title">OUR SERVICES</h2>
        <div className="category-toggle">
          <button
            className={selected === "men" ? "active" : ""}
            onClick={() => setSelected("men")}
            role="tab"
            aria-selected={selected === "men"}
            tabIndex={selected === "men" ? 0 : -1}
          >
            Men
          </button>
          <button
            className={selected === "women" ? "active" : ""}
            onClick={() => setSelected("women")}
            role="tab"
            aria-selected={selected === "women"}
            tabIndex={selected === "women" ? 0 : -1}
          >
            Women
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="card-container" role="tabpanel">
        {services[selected].map((service, i) => (
          <Link
            key={i}
            href={`/${selected.toLowerCase()}-${service.title.toLowerCase()}`}
            className="card-link"
            aria-label={`Explore ${service.title} for ${selected}`}
          >
            <div className="card">
              <Image
                src={service.img}
                alt={service.title}
                width={350}
                height={420}
                className="card-image"
              />
              <h3>{service.title}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Reviews Component */}
      <div id="reviews" style={{ scrollMarginTop: "100px" }}>
        <Reviews />
      </div>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <Container className="footer-content">
          <div className="footer-logo">
            <Image src="/images/main-logo.png" alt="DARK Salon Logo" width={150} height={50} />
          </div>

          <p className="footer-tagline">
            At DARK Salon, we believe in enhancing your natural beauty with expert care,
            personalized treatments, and a touch of luxury—because every visit should leave you
            feeling confident, refreshed, and radiant.
          </p>

          <div className="footer-social" role="navigation" aria-label="Social media links">
            <a href="#" className="facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" className="instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="twitter" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="youtube" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>

          <div className="footer-links" role="navigation" aria-label="Footer navigation links">
            <a href="#" tabIndex={0}>Home</a>
            <a href="/about" tabIndex={0}>About Us</a>
            <a href="/#services" tabIndex={0}>Services</a>
            <a href="/contact" tabIndex={0}>Contact</a>
          </div>
        </Container>
      </footer>

      <div className="footer-bottom-bar">
        <p>© 2025 DARK Salon. All rights reserved.</p>
      </div>
    </>
  );
}
