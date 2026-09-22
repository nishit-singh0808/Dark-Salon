import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/custom.css";
import "../styles/globals.css";
import "../styles/cards.css";
import "../styles/admin-navbar.css";

const publicRoutes = ["/signup", "/login", "/editProfile"];

function AuthGate({ children }) {
  const router = useRouter();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Skip auth guard for public routes so any per-page scroll listeners do not error
    if (publicRoutes.includes(router.pathname)) {
      setCheckingProfile(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          router.push("/signup");
        } else {
          const profile = docSnap.data();
          if (!profile.name || !profile.phone) {
            router.push("/signup");
          } else {
            setUser(currentUser);
          }
        }
      } else {
        setUser(null);
      }
      setCheckingProfile(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (checkingProfile) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }) {
  return (
    <AuthGate>
      <Component {...pageProps} />
    </AuthGate>
  );
}
