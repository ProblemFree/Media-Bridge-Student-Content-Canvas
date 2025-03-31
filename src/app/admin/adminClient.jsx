"use client";

import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";

export default function adminClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 24, background: "#1e293b", color: "white", borderRadius: 8 }}>
      <h2>Admin Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />
      <button onClick={handleLogin} style={{ padding: 10, width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: 4 }}>
        Login
      </button>
      {error && <p style={{ color: "tomato", marginTop: 12 }}>{error}</p>}
    </div>
  );
}
