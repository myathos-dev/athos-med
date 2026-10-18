import SalesHub from "./blocks/SalesHub.jsx";
import WorkQueue from "./blocks/WorkQueue.jsx";
import LeadsDashboard from "./blocks/LeadsDashboard.jsx";

// The blocks link to each other with plain <a href> paths, so routing is by pathname.
const ROUTES = {
  "/admin/sales": SalesHub,
  "/admin/sales/queue": WorkQueue,
  "/admin/sales/leads": LeadsDashboard,
};

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") {
    window.location.replace("/admin/sales");
    return null;
  }
  const Page = ROUTES[path];
  if (!Page) {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", padding: 40 }}>
        <p>Page not found.</p>
        <a href="/admin/sales">Go to Sales Hub</a>
      </div>
    );
  }
  return <Page />;
}
