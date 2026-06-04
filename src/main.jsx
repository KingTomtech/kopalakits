import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

// ─── Register Service Worker ────────────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered:", registration.scope);
      })
      .catch((err) => {
        console.log("SW registration failed:", err);
      });
  });
}

// ─── Register background sync on admin changes ─────────────────────────────
export async function triggerRefresh() {
  if ("serviceWorker" in navigator && "sync" in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register("kopala-refresh");
  }
}

function Root() {
  const [page, setPage] = useState("shop");

  if (page === "admin") {
    return <AdminDashboard onExit={() => setPage("shop")} />;
  }
  return <App onAdminAccess={() => setPage("admin")} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
