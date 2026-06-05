import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { registerServiceWorker } from "./setup/sw-registration.js";

registerServiceWorker();

function Root() {
  // If the URL is /admin, render the admin dashboard. Otherwise the
  // public site wrapped in a BrowserRouter.
  const isAdminPath = typeof window !== 'undefined' &&
    (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'));
  const [page, setPage] = useState(isAdminPath ? 'admin' : 'shop');

  // Keep the URL in sync when switching modes
  useEffect(() => {
    if (page === 'admin' && !isAdminPath) {
      window.history.pushState({}, '', '/admin');
    } else if (page === 'shop' && isAdminPath) {
      window.history.pushState({}, '', '/');
    }
  }, [page, isAdminPath]);

  // Listen for popstate (back/forward)
  useEffect(() => {
    const onPop = () => {
      const p = window.location.pathname;
      setPage(p === '/admin' || p.startsWith('/admin/') ? 'admin' : 'shop');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Listen for a custom event from anywhere in the app to enter admin mode
  useEffect(() => {
    const onAdmin = () => setPage('admin');
    window.addEventListener('kopala:open-admin', onAdmin);
    return () => window.removeEventListener('kopala:open-admin', onAdmin);
  }, []);

  if (page === 'admin') {
    return <AdminDashboard onExit={() => setPage('shop')} />;
  }
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
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
