// pages/SelectRole.jsx
import { useAuth } from "@clerk/clerk-react";

export default function SelectRole() {
  const { getToken } = useAuth();

  const setRole = async (role) => {
    const token = await getToken();

    await fetch("http://localhost:4000/api/auth/set-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    window.location.href = "/"; // redirect after
  };

  return (
    <div>
      <h2>Select your role</h2>

      <button onClick={() => setRole("buyer")}>
        I am a Buyer
      </button>

      <button onClick={() => setRole("seller")}>
        I am a Seller
      </button>
    </div>
  );
}