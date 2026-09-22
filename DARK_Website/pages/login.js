import Head from "next/head";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import { db, auth, provider } from "../lib/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

export default function Login() {
  const router = useRouter();
  const adminEmail = "singhnishit786@gmail.com"; // your admin email

  // ✅ Redirect on site reopen if user already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === adminEmail) {
          router.push("/admin/dashboard");
          return;
        }

        // Check if user exists in workers collection
        const workersRef = collection(db, "workers");
        const q = query(workersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          router.push("/worker-dashboard"); // redirect worker
          return;
        }

        // Otherwise check in regular users collection
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          localStorage.setItem("email", user.email);
          localStorage.setItem("uid", user.uid);
          router.push("/signup");
        } else {
          router.push("/");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email === adminEmail) {
        router.push("/admin/dashboard");
        return;
      }

      // Check if user exists in workers collection
      const workersRef = collection(db, "workers");
      const q = query(workersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        router.push("/worker-dashboard"); // redirect worker
        return;
      }

      // Otherwise check in regular users collection
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        localStorage.setItem("email", user.email);
        localStorage.setItem("uid", user.uid);
        router.push("/signup");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <>
      <Head>
        <title>DarkGlam Login</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="login-container">
        <div className="login-card">
          <img src="/images/main-logo.png" alt="DarkGlam Logo" className="logo" />
          <button onClick={handleGoogleLogin} className="google-btn">
            <img src="/images/google-icon.png" alt="Google icon" /> Sign in with Google
          </button>
          <p className="terms">
            By using this site, you agree to our{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
