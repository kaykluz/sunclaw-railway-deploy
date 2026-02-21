import { useEffect } from "react";

export default function Marketplace() {
  useEffect(() => {
    // Redirect to landing page funnel section
    window.location.replace("/#talk");
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1A1612",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9E958B",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      Redirecting...
    </div>
  );
}
