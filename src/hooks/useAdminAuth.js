import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const tokenResult = await getIdTokenResult(firebaseUser, true);
          const claims = tokenResult.claims;

          // Check admin boolean flag (not role string)
          setIsAdmin(claims.admin === true);
        } catch (err) {
          console.error("Error checking admin claim:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin, loading };
}
