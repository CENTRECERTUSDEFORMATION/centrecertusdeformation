import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const auth = useAuth();

  console.log("🔥 NAVBAR AUTH:", auth);

  if (auth.loading) return <div>Loading Navbar...</div>;

  return (
    <div style={{ padding: 20, background: "#eee" }}>
      <p>User: {auth.user?.email || "NONE"}</p>
      <p>Admin: {auth.isAdmin ? "YES" : "NO"}</p>

      {!auth.user ? (
        <button>LOGIN</button>
      ) : (
        <button onClick={auth.logout}>LOGOUT</button>
      )}
    </div>
  );
}