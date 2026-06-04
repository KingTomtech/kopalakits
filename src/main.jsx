import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { registerServiceWorker } from "./setup/sw-registration.js";

registerServiceWorker();

function Root() {
  const [page, setPage] = useState("shop");

  if (page === "admin") {
    return <AdminDashboard onExit={() => setPage("shop")} />;
  }
  return <App onAdminAccess={() => setPage("admin")} />;
}

// Root is mounted; export it so fast-refresh works during development.
export { Root };

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>,
);
