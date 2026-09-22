import Link from 'next/link';
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { MdNotifications } from 'react-icons/md';
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function AdminNavbar() {
  const router = useRouter();
  const auth = getAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="admin-navbar-container">
      {/* Left: Logo */}
      <div className="admin-navbar-logo">
        <img src="/images/small-logo.jpg" alt="Dark Salon Logo" />
      </div>

      {/* Hamburger (mobile only) */}
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={28} color="#fff" /> : <FiMenu size={28} color="#fff" />}
      </div>

      {/* Center: Menu items */}
      <ul className={`admin-navbar-menu ${isOpen ? "open" : ""}`}>
        <li><Link href="/admin/money" className="admin-navbar-item">Money</Link></li>
        <li><Link href="/admin/dashboard" className="admin-navbar-item">Dashboard</Link></li>
        <li><Link href="/admin/orders" className="admin-navbar-item">Orders</Link></li>
        <li><Link href="/admin/client-database" className="admin-navbar-item">Clients</Link></li>
        <li><Link href="/admin/serving-and-pricing" className="admin-navbar-item">Services</Link></li>
        <li><Link href="/admin/worker" className="admin-navbar-item">Workers</Link></li>
        <li><Link href="/admin/query-messages" className="admin-navbar-item">Query Messages</Link></li>
        <li><Link href="/admin/applications" className="admin-navbar-item">Applications</Link></li>
        <li><Link href="/admin/reviews" className="admin-navbar-item">Reviews</Link></li>
      </ul>

      {/* Right: Icons */}
      <div className="admin-navbar-icons">
        <Link href="/admin/notifications" passHref>
          <span role="button" tabIndex={0} className="admin-navbar-bell">
            <MdNotifications size={28} />
          </span>
        </Link>
        <button 
          className="admin-navbar-logout-button"
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
