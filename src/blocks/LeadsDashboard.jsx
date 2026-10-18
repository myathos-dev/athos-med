import { useState, useEffect, useRef } from "react";
import { useRecords, useRecordUpdate, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { toast } from "sonner";

/* ── Field maps ─────────────────────────────────────────────── */
const readSelect = q.select({
  name: "40Dqd", handle: "9DOVF", followers: "CxEJf", focus: "jvqF0",
  status: "FdlkA", assigned_rep: "KEi5L",
  phone_1: "xEZBF", phone_2: "idy7i", email: "sZk85",
  sales_notes: "YmVZJ", admin_reviewed: "51MnN", admin_notes: "K496s",
  tasks_completed: "A3XJ9", email_drip_active: "byeHC",
});

const writeFields = q.select({
  name: "40Dqd", handle: "9DOVF", followers: "CxEJf", focus: "jvqF0",
  status: "FdlkA", assigned_rep: "KEi5L",
  phone_1: "xEZBF", phone_2: "idy7i", email: "sZk85",
  sales_notes: "YmVZJ", admin_reviewed: "51MnN", admin_notes: "K496s",
  tasks_completed: "A3XJ9", email_drip_active: "byeHC",
});

/* ── Constants ─────────────────────────────────────────────── */
const P = "#245C3A", PD = "#1a4d2e", TEAL = "#16625F", BG = "#f5f2ed";
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

const NOTE_ACTIONS = ["Spoke To", "Sent DM", "Set Appointment", "Sent Email", "Left Voicemail", "No Answer", "Followed Up", "Other"];
const NOTE_NEXT = ["Call Back", "Follow Up DM", "Send Email", "Set Meeting", "Send Info", "No Action Needed", "Mark Cold"];

/* ── Helpers ────────────────────────────────────────────────── */
const stObj = (id) => { const lower = (id || "").toLowerCase().trim(); return STATUSES.find(s => s.id.toLowerCase() === lower) || STATUSES[0]; };

const fmtF = (v) => {
  if (!v && v !== 0) return "—";
  const s = String(v).replace(/[~,\s]/g, "").trim();
  const m = s.match(/^(\d+\.?\d*)\s*([kKmM]?)$/);
  if (m) { let num = parseFloat(m[1]); const sfx = m[2].toLowerCase(); if (sfx === "k") num *= 1000; if (sfx === "m") num *= 1000000; if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`; if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}K`; return num.toLocaleString(); }
  const n = parseInt(s, 10); if (isNaN(n)) return String(v); if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`; if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`; return n.toLocaleString();
};

const fmtDate = () => { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}-${String(d.getFullYear()).slice(-2)}`; };

const hasRep = (v) => Array.isArray(v) ? v.length > 0 : !!v;
const getRepLabel = (v) => Array.isArray(v) && v.length > 0 ? v[0].label || "Assigned" : typeof v === "string" && v ? v : "";

/* ── Icons ──────────────────────────────────────────────────── */
const I = {
  search: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  chevD: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
  chevR: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  ext: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>,
  phone: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  mail: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>,
  edit: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  x: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" /></svg>,
  chk: (c = "#fff", s = 14) => <svg width={s} height={s} fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  plus: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>,
  notepad: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>,
  shield: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  users: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
  grid: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  save: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>,
  ig: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>,
  copy: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>,
};

/* ── Shared styles ─────────────────────────────────────────── */
const inp = { width: "100%", fontFamily: FB, fontSize: 14, fontWeight: 500, padding: "9px 12px", borderRadius: 10, border: "2px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", color: PD, outline: "none", boxSizing: "border-box", transition: "border-color .2s" };
const focH = (e) => (e.target.style.borderColor = P);
const blurH = (e) => (e.target.style.borderColor = "rgba(0,0,0,0.08)");
const pill = (active, c) => ({ padding: "5px 12px", borderRadius: 9999, border: `1.5px solid ${active ? c : "rgba(0,0,0,0.08)"}`, backgroundColor: active ? `${c}12` : "#fff", color: active ? c : "#6B7280", fontSize: 12, fontWeight: 600, fontFamily: FB, cursor: "pointer", transition: "all .2s", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" });
const selectStyle = { ...inp, fontSize: 13, padding: "8px 30px 8px 10px", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Block() {
  const user = useCurrentUser();
  const isAdmin = isAdminUser();
  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecords({ select: readSelect, count: 100 });
  const updateRecord = useRecordUpdate({ fields: writeFields, onError: (err) => toast.error("Save failed", { description: err.message }) });

  /* Auto-paginate until all records loaded */
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [data, hasNextPage, isFetchingNextPage]);

  const [searchQ, setSearchQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  /* ── Edit state (for expanded row) ── */
  const [editStatus, setEditStatus] = useState("");
  const [editPhone1, setEditPhone1] = useState("");
  const [editPhone2, setEditPhone2] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [editAdminReviewed, setEditAdminReviewed] = useState(false);
  const [editDrip, setEditDrip] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ── Note modal state ── */
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteAction, setNoteAction] = useState("");
  const [noteDetail, setNoteDetail] = useState("");
  const [noteNext, setNoteNext] = useState("");

  /* ── Loading / error ── */
  const pagesLoading = hasNextPage || isFetchingNextPage;
  const allItems = data?.pages.flatMap(p => p.items) ?? [];

  if (status === "pending" || pagesLoading) return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "3px solid rgba(36,92,58,0.12)", borderTopColor: P, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ color: "#6B7280", fontSize: 14 }}>Loading leads{allItems.length > 0 ? ` (${allItems.length} loaded)` : ""}...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (status === "error") return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <p style={{ color: "#991B1B", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Failed to load leads</p>
        <p style={{ color: "#6B7280", fontSize: 14 }}>Check that the datasource is connected in Studio and all field IDs are valid.</p>
      </div>
    </div>
  );

  /* ── Build items ── */
  /* Non-admin: only show leads assigned to current user */
  const scopedItems = isAdmin ? allItems : allItems.filter(it => {
    const rep = it.fields.assigned_rep;
    if (!user?.id) return false;
    if (Array.isArray(rep)) return rep.some(r => r.id === user.id || r.label === user.fullName);
    return false;
  });

  /* Extract unique reps for admin filter */
  const repMap = {};
  allItems.forEach(it => {
    const rep = it.fields.assigned_rep;
    if (Array.isArray(rep)) rep.forEach(r => { if (r.id && r.label) repMap[r.id] = r.label; });
  });
  const reps = Object.entries(repMap).map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));

  /* Apply filters */
  let items = scopedItems;
  if (statusFilter !== "all") items = items.filter(it => stObj(it.fields.status || "New Lead").id === statusFilter);
  if (repFilter !== "all") items = items.filter(it => {
    const rep = it.fields.assigned_rep;
    if (repFilter === "__unassigned") return !hasRep(rep);
    if (Array.isArray(rep)) return rep.some(r => r.id === repFilter);
    return false;
  });
  if (searchQ.trim()) {
    const q = searchQ.toLowerCase();
    items = items.filter(it => {
      const f = it.fields;
      return (f.name || "").toLowerCase().includes(q) || (f.handle || "").toLowerCase().includes(q) || (f.focus || "").toLowerCase().includes(q) || (f.email || "").toLowerCase().includes(q);
    });
  }

  /* Sort */
  const STATUS_PRIORITY = { "New Lead": 0, "Look-up Info": 1, "pending-outreach": 2, "messaged": 3, "speaking-to": 4, "Next Contact": 5, "warm": 6, "cold": 7, "completed": 8 };
  items = [...items].sort((a, b) => {
    let va, vb;
    if (sortField === "status") {
      va = STATUS_PRIORITY[stObj(a.fields.status || "New Lead").id] ?? 99;
      vb = STATUS_PRIORITY[stObj(b.fields.status || "New Lead").id] ?? 99;
    } else if (sortField === "followers") {
      const parse = (v) => { if (!v) return 0; const s = String(v).replace(/[~,\s]/g, ""); const m = s.match(/^(\d+\.?\d*)\s*([kKmM]?)$/); if (!m) return 0; let n = parseFloat(m[1]); const sfx = m[2].toLowerCase(); if (sfx === "k") n *= 1000; if (sfx === "m") n *= 1000000; return n; };
      va = parse(a.fields.followers); vb = parse(b.fields.followers);
    } else {
      va = (a.fields[sortField] || "").toLowerCase();
      vb = (b.fields[sortField] || "").toLowerCase();
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  /* ── Summary stats ── */
  const totalScoped = scopedItems.length;
  const statusCounts = {};
  scopedItems.forEach(it => {
    const sid = stObj(it.fields.status || "New Lead").id;
    statusCounts[sid] = (statusCounts[sid] || 0) + 1;
  });

  /* ── Expand/collapse ── */
  const toggleExpand = (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    const item = items.find(it => it.id === id);
    if (!item) return;
    const f = item.fields;
    setEditStatus(f.status || "New Lead");
    setEditPhone1(f.phone_1 || "");
    setEditPhone2(f.phone_2 || "");
    setEditEmail(f.email || "");
    setEditNotes(f.sales_notes || "");
    setEditAdminNotes(f.admin_notes || "");
    setEditAdminReviewed(!!f.admin_reviewed);
    setEditDrip(!!f.email_drip_active);
    setExpandedId(id);
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const saveLead = (fields) => { if (expandedId) updateRecord.mutate({ recordId: expandedId, fields }); };

  const saveExpanded = () => {
    if (!expandedId || !user?.id) return;
    setSaving(true);
    const userLink = [{ id: user.id, label: user.fullName || user.firstName || "Rep" }];
    const fields = {
      status: editStatus,
      assigned_rep: userLink,
      phone_1: editPhone1.trim(),
      phone_2: editPhone2.trim(),
      email: editEmail.trim(),
      sales_notes: editNotes.trim(),
      email_drip_active: editDrip,
    };
    if (isAdmin) {
      fields.admin_reviewed = editAdminReviewed;
      fields.admin_notes = editAdminNotes.trim();
    }
    updateRecord.mutate(
      { recordId: expandedId, fields },
      {
        onSuccess: () => { setSaving(false); toast.success("Saved"); },
        onError: (err) => { setSaving(false); toast.error("Save failed", { description: err.message }); },
      }
    );
  };

  const addNote = () => {
    if (!noteAction) { toast.error("Select what happened"); return; }
    const userLink = user ? [{ id: user.id, label: user.fullName || user.firstName || "Rep" }] : [];
    const line = `${fmtDate()} // ${noteAction.toUpperCase()} // ${(noteDetail || "—").toUpperCase()} // ${(noteNext || "—").toUpperCase()}`;
    const updated = editNotes ? `${line}\n${editNotes}` : line;
    setEditNotes(updated);
    saveLead({
      sales_notes: updated,
      assigned_rep: userLink,
    });
    setShowNoteModal(false);
    setNoteAction(""); setNoteDetail(""); setNoteNext("");
  };

  const SortArrow = ({ field }) => {
    if (sortField !== field) return <span style={{ color: "rgba(0,0,0,0.15)", marginLeft: 3 }}>{I.chevD}</span>;
    return <span style={{ color: P, marginLeft: 3, transform: sortDir === "desc" ? "rotate(180deg)" : "none", display: "inline-flex", transition: "transform .2s" }}>{I.chevD}</span>;
  };

  /* ━━ RENDER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: FB }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}
.ld-row:hover{background-color:rgba(36,92,58,0.02)!important}
.ld-th:hover{color:${PD}!important}`}</style>

      {/* ── Note Modal ── */}
      {showNoteModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setShowNoteModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", padding: 28, fontFamily: FB }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: PD, margin: 0, fontFamily: FH }}>Add Note</h3>
              <button onClick={() => setShowNoteModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", backgroundColor: "rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>{I.x}</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 5 }}>What happened?</label>
                <select value={noteAction} onChange={e => setNoteAction(e.target.value)} style={selectStyle}>
                  <option value="">Select action...</option>
                  {NOTE_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".04em" }}>Details</label>
                  <span style={{ fontSize: 11, color: noteDetail.length > 70 ? "#991B1B" : "#9CA3AF" }}>{noteDetail.length}/75</span>
                </div>
                <input style={inp} placeholder="Brief summary" value={noteDetail} onChange={e => { if (e.target.value.length <= 75) setNoteDetail(e.target.value); }} onFocus={focH} onBlur={blurH} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 5 }}>Next step</label>
                <select value={noteNext} onChange={e => setNoteNext(e.target.value)} style={selectStyle}>
                  <option value="">Select...</option>
                  {NOTE_NEXT.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ padding: "8px 10px", borderRadius: 10, backgroundColor: "rgba(36,92,58,0.04)", border: "1px solid rgba(36,92,58,0.08)" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3 }}>Preview</div>
                <p style={{ fontSize: 12, fontFamily: "monospace", color: PD, margin: 0, lineHeight: 1.5 }}>
                  {fmtDate()} // {noteAction ? noteAction.toUpperCase() : "ACTION"} // {noteDetail ? noteDetail.toUpperCase() : "DETAILS"} // {noteNext ? noteNext.toUpperCase() : "NEXT STEP"}
                </p>
              </div>
              <button onClick={addNote} disabled={!noteAction} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 20px", borderRadius: 10, border: "none", backgroundColor: noteAction ? P : "rgba(0,0,0,0.04)", color: noteAction ? "#fff" : "#9CA3AF", fontSize: 14, fontWeight: 600, fontFamily: FB, cursor: noteAction ? "pointer" : "not-allowed", width: "100%" }}>Add Note</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "14px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: FH, fontSize: 22, fontWeight: 600, color: P }}>Athos</span>
            <span style={{ width: 1, height: 20, backgroundColor: "rgba(0,0,0,0.1)" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}>Leads Dashboard</span>
            {isAdmin && <span style={{ fontSize: 10, fontWeight: 700, color: TEAL, padding: "2px 8px", borderRadius: 9999, backgroundColor: "rgba(22,98,95,0.08)", border: "1px solid rgba(22,98,95,0.15)", textTransform: "uppercase", letterSpacing: ".05em" }}>Admin</span>}
          </div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(36,92,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: P, fontSize: 13, fontWeight: 700, fontFamily: FH }}>{(user.fullName || user.firstName || "U")[0]}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: PD }}>{user.fullName || user.firstName || "Rep"}</span>
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 60px" }}>

        {/* ── Summary Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
          <div onClick={() => setStatusFilter("all")} style={{ backgroundColor: statusFilter === "all" ? "#fff" : "#fff", borderRadius: 14, border: `1.5px solid ${statusFilter === "all" ? P : "rgba(0,0,0,0.06)"}`, padding: "14px 16px", cursor: "pointer", transition: "all .2s", boxShadow: statusFilter === "all" ? `0 0 0 1px ${P}` : "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>All Leads</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: PD, fontFamily: FH }}>{totalScoped}</div>
          </div>
          {STATUSES.filter(s => statusCounts[s.id]).map(s => (
            <div key={s.id} onClick={() => setStatusFilter(statusFilter === s.id ? "all" : s.id)} style={{ backgroundColor: "#fff", borderRadius: 14, border: `1.5px solid ${statusFilter === s.id ? s.c : "rgba(0,0,0,0.06)"}`, padding: "14px 16px", cursor: "pointer", transition: "all .2s", boxShadow: statusFilter === s.id ? `0 0 0 1px ${s.c}` : "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.c, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: PD, fontFamily: FH }}>{statusCounts[s.id]}</div>
            </div>
          ))}
        </div>

        {/* ── Controls Row ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 360 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>{I.search}</span>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search name, handle, focus..." style={{ ...inp, paddingLeft: 36, fontSize: 13 }} onFocus={focH} onBlur={blurH} />
          </div>

          {/* Admin: rep filter */}
          {isAdmin && reps.length > 0 && (
            <div style={{ flex: "0 0 auto" }}>
              <select value={repFilter} onChange={e => setRepFilter(e.target.value)} style={{ ...selectStyle, minWidth: 160 }}>
                <option value="all">All reps</option>
                <option value="__unassigned">Unassigned</option>
                {reps.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          )}

          <div style={{ flex: "0 0 auto", fontSize: 12, fontWeight: 500, color: "#9CA3AF" }}>
            {items.length} result{items.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1fr 40px", gap: 0, padding: "12px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "rgba(0,0,0,0.01)" }}>
            {[
              { key: "name", label: "Lead" },
              { key: "followers", label: "Followers" },
              { key: "focus", label: "Focus" },
              { key: "status", label: "Status" },
              { key: "assigned_rep", label: "Rep" },
            ].map(col => (
              <button key={col.key} className="ld-th" onClick={() => handleSort(col.key)} style={{ display: "flex", alignItems: "center", gap: 2, padding: 0, border: "none", backgroundColor: "transparent", cursor: "pointer", fontFamily: FB, fontSize: 11, fontWeight: 600, color: sortField === col.key ? PD : "#9CA3AF", textTransform: "uppercase", letterSpacing: ".05em" }}>
                {col.label}<SortArrow field={col.key} />
              </button>
            ))}
            <div />
          </div>

          {/* Rows */}
          {items.length === 0 && (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <p style={{ color: "#9CA3AF", fontSize: 14 }}>No leads match your filters.</p>
            </div>
          )}

          {items.map(it => {
            const f = it.fields;
            const so = stObj(f.status || "New Lead");
            const handle = (f.handle || "").replace("@", "");
            const repLabel = getRepLabel(f.assigned_rep);
            const isExpanded = expandedId === it.id;
            const noteLines = isExpanded && editNotes ? editNotes.split("\n").filter(l => l.trim()) : [];

            return (
              <div key={it.id}>
                {/* Main row */}
                <div className="ld-row" onClick={() => toggleExpand(it.id)} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1fr 40px", gap: 0, padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer", transition: "background-color .15s", backgroundColor: isExpanded ? "rgba(36,92,58,0.03)" : "transparent" }}>
                  {/* Lead */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(36,92,58,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: P, fontSize: 15, fontWeight: 700, fontFamily: FH, flexShrink: 0 }}>{(f.name || "?")[0]}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: PD, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name || "—"}</div>
                      {handle && <div style={{ fontSize: 12, color: P, fontWeight: 500 }}>@{handle}</div>}
                    </div>
                  </div>
                  {/* Followers */}
                  <div style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, color: PD }}>{fmtF(f.followers)}</div>
                  {/* Focus */}
                  <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#6B7280" }}>{f.focus || "—"}</div>
                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 9999, backgroundColor: `${so.c}12`, border: `1px solid ${so.c}30`, fontSize: 12, fontWeight: 600, color: so.c }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: so.c }} />
                      {so.label}
                    </span>
                  </div>
                  {/* Rep */}
                  <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: repLabel ? PD : "#9CA3AF", fontWeight: repLabel ? 500 : 400 }}>{repLabel || "Unassigned"}</div>
                  {/* Expand arrow */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform .2s", color: "#9CA3AF" }}>{I.chevR}</span>
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div style={{ padding: "20px 20px 24px", backgroundColor: "rgba(36,92,58,0.015)", borderBottom: `2px solid ${P}20` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                      {/* Left: contact + status */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {/* Quick links */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {handle && <a href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer" style={{ ...pill(false, P), textDecoration: "none", padding: "6px 12px" }}>{I.ig} @{handle} {I.ext}</a>}
                          {editPhone1 && <a href={`tel:${editPhone1.replace(/\D/g, "")}`} style={{ ...pill(false, TEAL), textDecoration: "none", padding: "6px 12px" }}>{I.phone} {editPhone1}</a>}
                          {editEmail && <a href={`mailto:${editEmail}`} style={{ ...pill(false, TEAL), textDecoration: "none", padding: "6px 12px" }}>{I.mail} {editEmail}</a>}
                        </div>

                        {/* Contact fields */}
                        <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                          <h4 style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: 0 }}>Contact Info</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", display: "block", marginBottom: 3 }}>Phone 1</label>
                              <input style={{ ...inp, fontSize: 13 }} value={editPhone1} onChange={e => setEditPhone1(e.target.value)} placeholder="—" onFocus={focH} onBlur={blurH} />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", display: "block", marginBottom: 3 }}>Phone 2</label>
                              <input style={{ ...inp, fontSize: 13 }} value={editPhone2} onChange={e => setEditPhone2(e.target.value)} placeholder="—" onFocus={focH} onBlur={blurH} />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", display: "block", marginBottom: 3 }}>Email</label>
                            <input style={{ ...inp, fontSize: 13 }} value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="—" onFocus={focH} onBlur={blurH} />
                          </div>
                        </div>

                        {/* Status selector */}
                        <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", padding: 14 }}>
                          <h4 style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 8px" }}>Status</h4>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {STATUSES.map(s => (
                              <button key={s.id} onClick={() => setEditStatus(s.id)} style={pill(editStatus === s.id, s.c)}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: editStatus === s.id ? s.c : "rgba(0,0,0,0.12)" }} />{s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Drip toggle */}
                        <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: PD }}>Email Drip Campaign</span>
                          <button onClick={() => setEditDrip(!editDrip)} style={{ width: 40, height: 22, borderRadius: 11, border: "none", backgroundColor: editDrip ? P : "rgba(0,0,0,0.12)", position: "relative", cursor: "pointer", transition: "background-color .2s", padding: 0, flexShrink: 0 }}>
                            <span style={{ position: "absolute", top: 2, left: editDrip ? 20 : 2, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left .2s" }} />
                          </button>
                        </div>

                        {/* Admin panel */}
                        {isAdmin && (
                          <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid rgba(22,98,95,0.15)", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ color: TEAL }}>{I.shield}</span>
                              <h4 style={{ fontSize: 11, fontWeight: 600, color: TEAL, textTransform: "uppercase", letterSpacing: ".04em", margin: 0 }}>Admin</h4>
                            </div>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setEditAdminReviewed(!editAdminReviewed)}>
                              <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 5, border: `2px solid ${editAdminReviewed ? P : "rgba(0,0,0,0.15)"}`, backgroundColor: editAdminReviewed ? P : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>{editAdminReviewed && I.chk("#fff", 12)}</span>
                              <span style={{ fontSize: 13, fontWeight: 500, color: PD }}>Reviewed</span>
                            </label>
                            <textarea value={editAdminNotes} onChange={e => setEditAdminNotes(e.target.value)} placeholder="Admin notes..." style={{ ...inp, minHeight: 60, fontSize: 12, resize: "vertical", lineHeight: 1.5 }} onFocus={focH} onBlur={blurH} />
                          </div>
                        )}
                      </div>

                      {/* Right: notes */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", padding: 14, flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <h4 style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>{I.notepad} Notes</h4>
                            <button onClick={() => { setShowNoteModal(true); setNoteAction(""); setNoteDetail(""); setNoteNext(""); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 9999, border: `1px solid ${P}`, backgroundColor: "transparent", color: P, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: FB }}>{I.plus} Add</button>
                          </div>

                          {noteLines.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 220, overflowY: "auto", flex: 1 }}>
                              {noteLines.map((line, i) => {
                                const parts = line.split("//").map(p => p.trim());
                                return (
                                  <div key={i} style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: i === 0 ? "rgba(36,92,58,0.04)" : "rgba(0,0,0,0.015)", borderLeft: i === 0 ? `3px solid ${P}` : "3px solid transparent" }}>
                                    <div style={{ fontSize: 11, fontFamily: "monospace", color: i === 0 ? PD : "#6B7280", lineHeight: 1.5, wordBreak: "break-word" }}>
                                      {parts[0] && <span style={{ fontWeight: 600 }}>{parts[0]}</span>}
                                      {parts[1] && <span style={{ color: P }}> // {parts[1]}</span>}
                                      {parts[2] && <span> // {parts[2]}</span>}
                                      {parts[3] && <span style={{ color: TEAL }}> // {parts[3]}</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>No notes yet</p>
                            </div>
                          )}
                        </div>

                        {/* Save */}
                        <button onClick={saveExpanded} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 20px", borderRadius: 12, border: "none", backgroundColor: saving ? "rgba(0,0,0,0.04)" : P, color: saving ? "#9CA3AF" : "#fff", fontSize: 14, fontWeight: 600, fontFamily: FB, cursor: saving ? "not-allowed" : "pointer", transition: "all .2s", width: "100%" }}>
                          {saving ? "Saving..." : <>{I.save} Save Changes</>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No-login state */}
        {!user && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: PD, marginBottom: 6 }}>Sign in to view your leads</p>
            <p style={{ fontSize: 14, color: "#6B7280" }}>You must be logged in to access the leads dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}