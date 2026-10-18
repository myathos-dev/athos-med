import { useState, useEffect } from "react";
import { useRecords, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";

/* ── Field map (read-only — no writes on this page) ───────── */
const readSelect = q.select({
  name: "40Dqd", handle: "9DOVF", followers: "CxEJf", focus: "jvqF0",
  status: "FdlkA", assigned_rep: "KEi5L",
  phone_1: "xEZBF", phone_2: "idy7i", email: "sZk85",
  sales_notes: "YmVZJ", tasks_completed: "A3XJ9",
});

/* ── Constants ─────────────────────────────────────────────── */
const P = "#245C3A", PD = "#1a4d2e", TEAL = "#16625F", BG = "#f5f2ed", GOLD = "#D9BA7A";
const FH = "'DM Serif Display', Georgia, serif";
const FB = "'DM Sans', system-ui, sans-serif";

const isAdminUser = () => {
  try {
    const u = window.logged_in_user;
    if (u?.Role?.label === "Admin") return true;
    if (u?.softr_user_groups?.some(g => g.name === "Admin")) return true;
  } catch {}
  return false;
};

const STATUSES = [
  { id: "New Lead", label: "New Lead", c: "#8B5CF6" },
  { id: "pending-outreach", label: "Pending", c: "#6B7280" },
  { id: "messaged", label: "Messaged", c: "#2563EB" },
  { id: "speaking-to", label: "Speaking To", c: "#D97706" },
  { id: "Next Contact", label: "Next Contact", c: "#0EA5E9" },
  { id: "Look-up Info", label: "Look-up Info", c: "#F59E0B" },
  { id: "warm", label: "Warm", c: P },
  { id: "cold", label: "Cold", c: "#991B1B" },
  { id: "completed", label: "Completed", c: "#059669" },
];

const stObj = (id) => { const lower = (id || "").toLowerCase().trim(); return STATUSES.find(s => s.id.toLowerCase() === lower) || STATUSES[0]; };
const hasRep = (v) => Array.isArray(v) ? v.length > 0 : !!v;

/* ── Icons ──────────────────────────────────────────────────── */
const I = {
  queue: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  leads: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
  chevR: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  zap: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  target: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  check: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  clock: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  pulse: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Block() {
  const user = useCurrentUser();
  const isAdmin = isAdminUser();
  const { data, status } = useRecords({ select: readSelect, count: 100 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  /* ── Loading / error ── */
  if (status === "pending") return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "3px solid rgba(36,92,58,0.12)", borderTopColor: P, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ color: "#6B7280", fontSize: 14 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (status === "error") return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB }}>
      <p style={{ color: "#991B1B", fontSize: 16, fontWeight: 600 }}>Failed to load data. Check datasource connection.</p>
    </div>
  );

  /* ── Compute stats ── */
  const allItems = data?.pages.flatMap(p => p.items) ?? [];

  // Queue: same filter logic as lead-queue-block
  const queueItems = allItems.filter(it => {
    if ((it.fields.status || "").trim() === "Look-up Info") return true;
    if (!hasRep(it.fields.assigned_rep)) return true;
    const tc = it.fields.tasks_completed;
    return !tc || tc === "[]" || tc.length < 3;
  });

  // My leads: assigned to current user
  const myLeads = user?.id ? allItems.filter(it => {
    const rep = it.fields.assigned_rep;
    if (Array.isArray(rep)) return rep.some(r => r.id === user.id || r.label === user.fullName);
    return false;
  }) : [];

  // Status breakdown for my leads
  const myStatusCounts = {};
  myLeads.forEach(it => {
    const sid = stObj(it.fields.status || "New Lead").id;
    myStatusCounts[sid] = (myStatusCounts[sid] || 0) + 1;
  });

  // Active leads needing attention (not completed, not cold)
  const myActive = myLeads.filter(it => {
    const sid = stObj(it.fields.status || "New Lead").id;
    return sid !== "completed" && sid !== "cold";
  });

  // Quick stats for admin
  const totalAll = allItems.length;
  const totalCompleted = allItems.filter(it => stObj(it.fields.status || "New Lead").id === "completed").length;

  const queueHasLeads = queueItems.length > 0;
  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "there";

  /* ━━ RENDER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: FB }}>
      <style>{`
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(36,92,58,0.15)}50%{box-shadow:0 0 0 12px rgba(36,92,58,0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.sh-card{transition:all .3s cubic-bezier(.4,0,.2,1)}
.sh-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,0.08)!important}
      `}</style>

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "14px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: FH, fontSize: 22, fontWeight: 600, color: P }}>Athos</span>
            <span style={{ width: 1, height: 20, backgroundColor: "rgba(0,0,0,0.1)" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}>Sales Hub</span>
          </div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(36,92,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: P, fontSize: 13, fontWeight: 700, fontFamily: FH }}>{(user.fullName || "U")[0]}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: PD }}>{user.fullName || user.firstName || "Rep"}</span>
              {isAdmin && <span style={{ fontSize: 10, fontWeight: 700, color: TEAL, padding: "2px 8px", borderRadius: 9999, backgroundColor: "rgba(22,98,95,0.08)", border: "1px solid rgba(22,98,95,0.15)", textTransform: "uppercase", letterSpacing: ".05em" }}>Admin</span>}
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── Greeting ── */}
        <div style={{ marginBottom: 40, animation: "fadeUp .5s ease both" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: TEAL, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Sales Dashboard</p>
          <h1 style={{ fontFamily: FH, fontSize: 36, fontWeight: 600, color: PD, margin: "0 0 8px", lineHeight: 1.15 }}>
            Hey {firstName}.
          </h1>
          <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.6, maxWidth: 520 }}>
            {queueHasLeads
              ? `There are ${queueItems.length} leads ready to work. Your pipeline has ${myLeads.length} assigned.`
              : `Your pipeline has ${myLeads.length} leads assigned. Queue is clear.`
            }
          </p>
        </div>

        {/* ── Attention banner (if queue has leads) ── */}
        {queueHasLeads && (
          <div style={{ marginBottom: 28, padding: "16px 20px", borderRadius: 14, backgroundColor: PD, display: "flex", alignItems: "center", gap: 14, animation: "fadeUp .5s ease .1s both", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${PD} 0%, ${P} 50%, ${TEAL} 100%)`, opacity: 0.95 }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 14, width: "100%", flexWrap: "wrap" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, flexShrink: 0, animation: pulse ? "pulseGlow 2s ease infinite" : "none" }}>
                {I.zap}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
                  {queueItems.length} lead{queueItems.length !== 1 ? "s" : ""} waiting in the queue
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                  Unclaimed and ready for outreach. First rep to open it owns it.
                </div>
              </div>
              <a href="/admin/sales/queue" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, backgroundColor: "#fff", color: PD, fontSize: 14, fontWeight: 600, fontFamily: FB, textDecoration: "none", flexShrink: 0, transition: "all .2s" }}>
                Work Queue {I.chevR}
              </a>
            </div>
          </div>
        )}

        {/* ── Main cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32, animation: "fadeUp .5s ease .15s both" }}>

          {/* Queue Card */}
          <a href="/admin/sales/queue" className="sh-card" onMouseEnter={() => setHoveredCard("queue")} onMouseLeave={() => setHoveredCard(null)} style={{ display: "block", textDecoration: "none", backgroundColor: "#fff", borderRadius: 20, border: `1.5px solid ${hoveredCard === "queue" ? P : "rgba(0,0,0,0.06)"}`, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", overflow: "hidden", cursor: "pointer" }}>
            <div style={{ padding: "28px 24px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: queueHasLeads ? "rgba(36,92,58,0.08)" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: queueHasLeads ? P : "#9CA3AF" }}>
                  {I.queue}
                </div>
                <span style={{ color: hoveredCard === "queue" ? P : "#9CA3AF", transition: "color .2s" }}>{I.chevR}</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: FH, fontSize: 40, fontWeight: 600, color: queueHasLeads ? PD : "#9CA3AF", lineHeight: 1 }}>{queueItems.length}</span>
              </div>
              <h2 style={{ fontFamily: FH, fontSize: 20, fontWeight: 600, color: PD, margin: "0 0 6px" }}>Lead Queue</h2>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                {queueHasLeads ? "Unworked leads ready for outreach. View profile, send DM, find contact info." : "All caught up. New leads will appear here."}
              </p>
            </div>
            {queueHasLeads && (
              <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(0,0,0,0.04)", backgroundColor: "rgba(36,92,58,0.02)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: P, animation: "pulseGlow 2s ease infinite" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: P }}>Active</span>
                <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 4 }}>
                  {queueItems.filter(it => stObj(it.fields.status || "New Lead").id === "New Lead").length} new
                </span>
              </div>
            )}
          </a>

          {/* My Leads Card */}
          <a href="/admin/sales/leads" className="sh-card" onMouseEnter={() => setHoveredCard("leads")} onMouseLeave={() => setHoveredCard(null)} style={{ display: "block", textDecoration: "none", backgroundColor: "#fff", borderRadius: 20, border: `1.5px solid ${hoveredCard === "leads" ? TEAL : "rgba(0,0,0,0.06)"}`, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", overflow: "hidden", cursor: "pointer" }}>
            <div style={{ padding: "28px 24px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: myLeads.length > 0 ? "rgba(22,98,95,0.08)" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: myLeads.length > 0 ? TEAL : "#9CA3AF" }}>
                  {I.leads}
                </div>
                <span style={{ color: hoveredCard === "leads" ? TEAL : "#9CA3AF", transition: "color .2s" }}>{I.chevR}</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: FH, fontSize: 40, fontWeight: 600, color: myLeads.length > 0 ? PD : "#9CA3AF", lineHeight: 1 }}>{myLeads.length}</span>
              </div>
              <h2 style={{ fontFamily: FH, fontSize: 20, fontWeight: 600, color: PD, margin: "0 0 6px" }}>{isAdmin ? "All Leads" : "My Leads"}</h2>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                {isAdmin ? "Full CRM view. Filter by rep, status, and search across all leads." : "Manage your assigned pipeline. Edit contacts, update status, add notes."}
              </p>
            </div>
            {myActive.length > 0 && (
              <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(0,0,0,0.04)", backgroundColor: "rgba(22,98,95,0.02)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: TEAL }}>{myActive.length} active</span>
                <span style={{ width: 1, height: 12, backgroundColor: "rgba(0,0,0,0.08)" }} />
                {STATUSES.filter(s => myStatusCounts[s.id] && s.id !== "completed" && s.id !== "cold").slice(0, 4).map(s => (
                  <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B7280" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: s.c }} />{myStatusCounts[s.id]}
                  </span>
                ))}
              </div>
            )}
          </a>
        </div>

        {/* ── Quick Stats (admin gets extra row) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, animation: "fadeUp .5s ease .25s both" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ color: "#9CA3AF" }}>{I.pulse}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Pipeline</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: PD, fontFamily: FH }}>{myActive.length}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>active leads</div>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ color: "#9CA3AF" }}>{I.target}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Warm</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: P, fontFamily: FH }}>{myStatusCounts["warm"] || 0}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>warm leads</div>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ color: "#9CA3AF" }}>{I.check}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Closed</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#059669", fontFamily: FH }}>{myStatusCounts["completed"] || 0}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>completed</div>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ color: "#9CA3AF" }}>{I.clock}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Queue</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: queueHasLeads ? GOLD : "#9CA3AF", fontFamily: FH }}>{queueItems.length}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>unclaimed</div>
          </div>
        </div>

        {/* ── Admin overview ── */}
        {isAdmin && (
          <div style={{ marginTop: 20, backgroundColor: "#fff", borderRadius: 16, border: "1px solid rgba(22,98,95,0.12)", padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", animation: "fadeUp .5s ease .35s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: TEAL }}>{I.leads}</span>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: TEAL, textTransform: "uppercase", letterSpacing: ".04em", margin: 0 }}>Team Overview</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 10, backgroundColor: "rgba(36,92,58,0.03)" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>Total in database</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: PD, fontFamily: FH }}>{totalAll}</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 10, backgroundColor: "rgba(36,92,58,0.03)" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>Completed</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#059669", fontFamily: FH }}>{totalCompleted}</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 10, backgroundColor: "rgba(36,92,58,0.03)" }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>Conversion</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEAL, fontFamily: FH }}>{totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0}%</div>
              </div>
            </div>

            {/* Rep breakdown */}
            {(() => {
              const repStats = {};
              allItems.forEach(it => {
                const rep = it.fields.assigned_rep;
                if (Array.isArray(rep) && rep.length > 0) {
                  const key = rep[0].label || rep[0].id;
                  if (!repStats[key]) repStats[key] = { total: 0, active: 0, completed: 0 };
                  repStats[key].total++;
                  const sid = stObj(it.fields.status || "New Lead").id;
                  if (sid === "completed") repStats[key].completed++;
                  else if (sid !== "cold") repStats[key].active++;
                }
              });
              const entries = Object.entries(repStats).sort((a, b) => b[1].total - a[1].total);
              if (entries.length === 0) return null;

              return (
                <div style={{ marginTop: 14, borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>By Rep</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {entries.map(([name, s]) => (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "rgba(36,92,58,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: P, fontSize: 12, fontWeight: 700, fontFamily: FH, flexShrink: 0 }}>{name[0]}</div>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: PD, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 12, color: "#6B7280" }}>{s.total} total</span>
                          <span style={{ fontSize: 12, color: P, fontWeight: 600 }}>{s.active} active</span>
                          <span style={{ fontSize: 12, color: "#059669" }}>{s.completed} closed</span>
                        </div>
                        {/* Mini bar */}
                        <div style={{ width: 60, height: 4, borderRadius: 2, backgroundColor: "rgba(0,0,0,0.04)", overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ width: `${s.total > 0 ? (s.completed / s.total) * 100 : 0}%`, height: "100%", borderRadius: 2, backgroundColor: "#059669", transition: "width .3s" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── No login ── */}
        {!user && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontFamily: FH, fontSize: 22, fontWeight: 600, color: PD, marginBottom: 8 }}>Sign in to continue</p>
            <p style={{ fontSize: 14, color: "#6B7280" }}>You need to be logged in to access the sales dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}