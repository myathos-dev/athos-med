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
  lead_type: "AjmPW", consumer_note: "bgFsa",
  skool_community_link: "5CkjD", tags: "cd3tD",
  clinic_name: "y9l68", address: "JtT0i", gate_keeper: "U6Ba1",
  last_activity: "T9jJR",
});

const writeFields = q.select({
  name: "40Dqd", handle: "9DOVF", followers: "CxEJf", focus: "jvqF0",
  status: "FdlkA", assigned_rep: "KEi5L",
  phone_1: "xEZBF", phone_2: "idy7i", email: "sZk85",
  sales_notes: "YmVZJ", admin_reviewed: "51MnN", admin_notes: "K496s",
  tasks_completed: "A3XJ9", email_drip_active: "byeHC",
  lead_type: "AjmPW", consumer_note: "bgFsa",
  clinic_name: "y9l68", address: "JtT0i", gate_keeper: "U6Ba1",
});

/* ── Constants ─────────────────────────────────────────────── */
const P = "#245C3A", PD = "#1a4d2e", TEAL = "#16625F", BG = "#f5f2ed";
const FH = "'DM Serif Display', Georgia, serif";
const FB = "'DM Sans', system-ui, sans-serif";

const isAdminUser = () => { try { const u = window.logged_in_user; return u?.Role?.label === "Admin" || u?.softr_user_groups?.some(g => g.name === "Admin"); } catch { return false; } };

const isConsumer = (it) => { const v = it?.fields?.lead_type; const s = typeof v === "object" ? (v?.label || "") : (v || ""); const l = s.toLowerCase(); return l === "consumer" || l === "micro-influencer"; };
const isMicro = (it) => { const v = it?.fields?.lead_type; const s = typeof v === "object" ? (v?.label || "") : (v || ""); return s.toLowerCase() === "micro-influencer"; };
const isClinic = (it) => { const v = it?.fields?.lead_type; const s = typeof v === "object" ? (v?.label || "") : (v || ""); return s.toLowerCase() === "clinic"; };

const hasRep = (v) => Array.isArray(v) ? v.length > 0 : !!v;

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
const CONSUMER_STATUS_IDS = ["New Lead", "messaged", "cold"];
const STATUS_PRIORITY = { "New Lead": 0, "Next Contact": 1, "Look-up Info": 2, "pending-outreach": 3, "messaged": 4, "speaking-to": 5, "warm": 6, "cold": 7, "completed": 8 };

const TASKS = [
  { id: "view_profile", label: "View Profile", type: "link", icon: "eye" },
  { id: "send_dm", label: "Send DM", type: "dm", icon: "send" },
  { id: "nudge", label: "Nudge", type: "nudge", icon: "send", statusCond: "messaged" },
  { id: "lookup_info", label: "Lookup Info", type: "info", skip: true, icon: "search", statusCond: "Look-up Info" },
  { id: "lookup_phone", label: "Lookup Phone 1", type: "input", field: "phone_1", skip: true, icon: "phone" },
  { id: "add_phone_2", label: "Lookup Phone 2", type: "input", field: "phone_2", skip: true, icon: "phone" },
  { id: "lookup_email", label: "Lookup Email", type: "input", field: "email", skip: true, icon: "mail" },
  { id: "call", label: "Call", type: "call", cond: "phone_1", icon: "phoneOut" },
  { id: "notes", label: "Document Notes", type: "textarea", icon: "edit" },
];

const CONSUMER_TASKS = [
  { id: "view_profile", label: "View Profile", type: "link", icon: "eye" },
  { id: "add_name", label: "Add Name", type: "input", field: "name", icon: "edit" },
  { id: "send_dm", label: "Send DM", type: "dm", icon: "send" },
  { id: "nudge", label: "Nudge", type: "nudge", icon: "send", statusCond: "messaged" },
  { id: "notes", label: "Document Notes", type: "textarea", icon: "edit" },
];

const NC_TASKS = [
  { id: "nudge", label: "Nudge", type: "nudge", icon: "send", ncToggle: "dm" },
  { id: "call", label: "Call", type: "call", cond: "phone_1", icon: "phoneOut", ncToggle: "call" },
  { id: "notes", label: "Document Notes", type: "textarea", icon: "edit" },
];

const CLINIC_NC_TASKS = [
  { id: "call", label: "Call", type: "call", cond: "phone_1", icon: "phoneOut" },
  { id: "call_2", label: "Call Phone 2", type: "call", cond: "phone_2", icon: "phoneOut" },
  { id: "send_email", label: "Send Email", type: "email_outreach", icon: "mail" },
  { id: "notes", label: "Document Notes", type: "textarea", icon: "edit" },
];

const DM_TEMPLATES = [
  "Hey {first}! Your content is awesome — love what you're doing in the {focus} space. Do you ever partner with wellness brands? We have something that might be a perfect fit.",
  "Hi {first}! Been following your page and your audience is clearly dialed in on health + performance. We work with creators like you on a residual partnership — would you be open to hearing more?",
  "Hey {first}! Quick question — do you partner with other brands? We run a referral program in the peptide/wellness space that pays 20-30% residual monthly. No minimums, no exclusivity. Let me know if you'd want the details.",
];

const INFLUENCER_PRODUCT_DM_TEMPLATES = [
  "Hey {first}! Love what you're building in the {focus} space. We're offering a few select creators access to our full peptide line at cost — no markup, just wholesale. All we'd ask is you share your experience when it makes sense for your content. Interested?",
  "Hey {first}! Quick one — we're setting up a handful of creators in the {focus} space with product at cost for life. No commission structure, no contracts — just use it, talk about it if you like it. Want the details?",
  "Hey {first}! Your audience is exactly who we built this for. We'd love to get you set up with product at cost — wholesale pricing, no strings. If it works for your content, great. If not, no hard feelings. Worth a look?",
];

const CONSUMER_DM_TEMPLATES = [
  "Hey {first}! Saw your comment about {topic} — are you currently using anything or still researching? We run a licensed telehealth platform for peptides and could probably help you dial things in.",
  "Hey {first}! Your comment about {topic} caught my eye — a lot of people are looking into that right now. We work with licensed providers who build custom protocols and ship pharmacy-compounded meds direct. Want me to send you the details?",
  "Hey {first}! Noticed you were asking about {topic} — I get that question a lot. Short answer: there's a legit way to do it through licensed telehealth that most people don't know about. Want me to send you a quick rundown?",
  "Hey {first}! Noticed your comment on {topic}. We've been helping a lot of people with exactly that — licensed providers, compounded meds, everything legit and supervised. Takes about 5 min to get started if you want to check it out.",
];

const MICRO_DM_TEMPLATES = [
  "Hey {first}! Love what you're sharing about {topic}. We're picking a few people in the peptide space to get our products at cost — basically wholesale, no markup. All we ask is you share your honest experience with your followers when you feel like it. Want in?",
  "Hey {first}! Your content on {topic} is exactly what our community needs to see more of. We'd love to set you up with product at cost for life — you just share what's working for you, keep it real. Want me to set that up?",
  "Hey {first}! Noticed your posts about {topic} and think you'd be a perfect fit. We have a creator program — product at cost for life, no minimums, no scripts. Just try it, share your results, and your followers get a discount. Interested?",
];

const NUDGE_TEMPLATES = [
  "Hey {first}! Just making sure this didn't get buried — did you get a chance to see my last message?",
  "Hey {first}! Following up real quick — wanted to make sure my message came through. Would love to chat if you're open to it.",
  "Hey {first}! Bumping this up in case it got lost in the mix. Still think this could be a great fit — let me know if you're curious.",
  "Hey {first}! Just following up in case you missed this.",
];

const CLINIC_NUDGE_TEMPLATES = [
  { subject: "Following up — {clinic}", body: "Hello {name},\n\nFollowing up on my previous email regarding peptide and GLP-1 supply for {clinic}. We offer competitive rates, reliable fulfillment, and nationwide 503(a)/503(b) sourcing. We can provide end-to-end support or simply integrate as a product supplier to reduce your costs. All of it is white labeled so your patients never see our name.\n\nOverview: https://www.myathos.com/enterprise\n\nDoes it make sense to schedule a call this week?" },
  { subject: "{clinic} — peptide supply follow-up", body: "Hello {name},\n\nCircling back on my last email. We carry Semaglutide, Tirzepatide, BPC-157, and 1,800+ SKUs across 11 pharmacies — covering weight loss, peptides, TRT/HRT, sexual health, recovery, and wellness. Competitive rates, reliable fulfillment, nationwide 503(a)/503(b) sourcing.\n\nOverview: https://www.myathos.com/enterprise\n\nWould it make sense to connect for 15 minutes this week?" },
  { subject: "Quick follow-up — {clinic}", body: "Hello {name},\n\nOne more follow-up. We offer end-to-end support — including medical approvals and patient support — or can simply integrate as a product supplier to reduce your costs. All of it is white labeled so your patients never see our name. 50-state coverage, 1,800+ SKUs, your pricing.\n\nhttps://www.myathos.com/enterprise\n\nPlease let me know if it makes sense to schedule a call." },
];

const CLINIC_EMAIL_CATS = [
  { id: "first-touch", label: "First Touch", statuses: ["New Lead", "pending-outreach", "cold"] },
  { id: "follow-up", label: "Follow-up", statuses: ["messaged", "Next Contact"] },
  { id: "warm", label: "Warm", statuses: ["warm", "speaking-to"] },
];

const CLINIC_EMAIL_TEMPLATES = {
  "first-touch": {
    owner: { subject: "{clinic} — peptide and GLP-1 supply", body: "Hello {name},\n\nI'm reaching out regarding peptide and GLP-1 supply for {clinic}. We offer competitive rates, reliable fulfillment, and nationwide 503(a)/503(b) sourcing across an 11-pharmacy network.\n\nWe can provide end-to-end support — including medical approvals and patient support — or simply integrate as a product supplier to reduce your costs. All of it is white labeled so your patients never see our name. Our licensed physician network handles all prescribing, so your clinic doesn't need an MD on staff.\n\nProducts include Semaglutide, Tirzepatide, BPC-157, TB-500, CJC/Ipamorelin, MK-677, NAD+, and more across 1,800+ SKUs — covering weight loss, peptides, TRT/HRT, sexual health, recovery, and wellness. You set your own prices. No inventory, no contracts.\n\nPlatform overview: https://www.myathos.com/enterprise\n\nDoes it make sense to schedule a call this week?" },
    gatekeeper: { subject: "Quick question for the team at {clinic}", body: "Hello {gatekeeper},\n\nI'm reaching out regarding a peptide and GLP-1 supply partnership for {clinic}. We offer competitive rates, reliable fulfillment, and nationwide 503(a)/503(b) sourcing. Our physician network handles all prescribing — no liability for the clinic's staff.\n\nBrief overview here: https://www.myathos.com/enterprise\n\nCould you help me connect with {name} or whoever handles vendor partnerships?" },
  },
  "follow-up": {
    owner: { subject: "{clinic} — following up on peptide supply", body: "Hello {name},\n\nFollowing up on my last email regarding peptide and GLP-1 supply for {clinic}.\n\nWe offer competitive rates, reliable fulfillment, and nationwide 503(a)/503(b) sourcing across 11 pharmacies and 1,800+ SKUs. We can provide end-to-end support — including medical approvals and patient support — or simply integrate as a product supplier to reduce your costs. All of it is white labeled so your patients never see our name.\n\nProducts include Semaglutide, Tirzepatide, BPC-157, TB-500, CJC/Ipamorelin, MK-677, NAD+, and more — covering weight loss, peptides, TRT/HRT, sexual health, recovery, and wellness. You set your own prices, no contracts.\n\nHere's the info: https://www.myathos.com/enterprise\n\nWould it make sense to schedule a quick call this week?" },
    gatekeeper: { subject: "Following up — {clinic}", body: "Hello {gatekeeper},\n\nCircling back on my note regarding Athos. We offer competitive rates, reliable fulfillment, and nationwide 503(a)/503(b) sourcing. Our physician network handles all prescribing — no liability for your staff.\n\nOverview here: https://www.myathos.com/enterprise\n\nCould you pass this to {name} or help me get 5 minutes on their calendar?" },
  },
  "warm": {
    owner: { subject: "Next steps — {clinic}", body: "Hello {name},\n\nGood speaking with you. Here's the summary:\n\nWe offer competitive rates, reliable fulfillment, and nationwide 503(a)/503(b) sourcing across 11 pharmacies. We can provide end-to-end support — including medical approvals and patient support — or simply integrate as a product supplier to reduce your costs. All of it is white labeled so your patients never see our name.\n\n1,800+ SKUs covering weight loss, peptides, TRT/HRT, sexual health, recovery, and wellness. {clinic} sets its own pricing. No inventory, no contracts, no staffing overhead.\n\nHere's all the info you asked for: https://www.myathos.com/enterprise\n\nDoes it make sense to schedule 15 minutes this week to walk through the portal and catalog?" },
    gatekeeper: { subject: "Following up — {clinic}", body: "Hello {gatekeeper},\n\nGood speaking with you. As discussed, we offer competitive rates, reliable fulfillment, and nationwide 503(a)/503(b) sourcing. We can provide end-to-end support — including medical approvals and patient support — or simply integrate as a product supplier to reduce your costs. All of it is white labeled so your patients never see our name.\n\nOverview: https://www.myathos.com/enterprise\n\nDoes it make sense to schedule 15 minutes this week to walk through the details?" },
  },
};

const CLINIC_TASKS = [
  { id: "lookup_info", label: "Lookup Info", type: "info", skip: true, icon: "search", statusCond: "Look-up Info" },
  { id: "lookup_phone", label: "Lookup Phone 1", type: "input", field: "phone_1", skip: true, icon: "phone" },
  { id: "add_phone_2", label: "Lookup Phone 2", type: "input", field: "phone_2", skip: true, icon: "phone" },
  { id: "lookup_email", label: "Lookup Email", type: "input", field: "email", skip: true, icon: "mail" },
  { id: "call", label: "Call", type: "call", cond: "phone_1", icon: "phoneOut" },
  { id: "call_2", label: "Call Phone 2", type: "call", cond: "phone_2", icon: "phoneOut" },
  { id: "send_email", label: "Send Email", type: "email_outreach", icon: "mail" },
  { id: "nudge", label: "Nudge", type: "nudge", icon: "send", statusCond: "messaged" },
  { id: "notes", label: "Document Notes", type: "textarea", icon: "edit" },
];

const topicPhrase = (raw) => {
  if (!raw) return "peptides";
  const s = (typeof raw === "object" ? (raw?.label || "") : raw).trim();
  const passthrough = /^(GHK-Cu|MOTS-C|BPC-157|TB-500|PT-141|CJC-1295|Ipamorelin|Semaglutide|Tirzepatide|retatrutide|NAD\+?|MK-677)/i;
  if (passthrough.test(s)) return s;
  const lower = s.toLowerCase();
  if (lower.includes("sourcing") || lower.includes("where to")) return "finding a legit peptide source";
  if (lower.includes("weight") || lower.includes("glp")) return "weight loss options";
  if (lower.includes("fitness") || lower.includes("performance")) return "peptides for performance";
  if (lower.includes("anti-aging") || lower.includes("longevity")) return "longevity protocols";
  if (lower.includes("hormone") || lower.includes("trt")) return "hormone optimization";
  return s;
};

const NOTE_ACTIONS = ["Spoke To", "Sent DM", "Set Appointment", "Sent Email", "Left Voicemail", "No Answer", "Followed Up", "Other"];
const NOTE_NEXT = ["Call Back", "Follow Up DM", "Send Email", "Set Meeting", "Send Info", "Lookup Info", "Verify Info", "No Action Needed", "Mark Cold"];

const OBJECTIONS = [
  { id: "not-interested", label: "Not interested", icon: "ban", response: "Totally understand — most of our best partners said the same thing initially. Quick question before I let you go: do your clients ever ask you about peptides, GLP-1s, or hormone optimization? Because if they do, you're leaving money on the table by not having an answer for them. We're not asking you to sell anything — just share a link. Can I send you a one-pager so you can see what I mean?", tip: "Reframe from 'partnership' to 'answering a question your clients already have.' Most people say no to what they think you're selling — not what you're actually offering." },
  { id: "working-with-brand", label: "Working with a brand", icon: "link", response: "That's great — means you already know how partnerships work. We're non-exclusive, so there's zero conflict. The question is really just: does your current partner cover peptides and clinical wellness? Because if not, you're leaving a gap — and your audience is probably already Googling it. We fill that gap and pay 20-30% monthly residual on top of whatever else you're doing.", tip: "Don't compete. Position Athos as complementary. Most brand deals are one-time or product-based — ours is recurring revenue in a category they probably don't cover." },
  { id: "busy", label: "Busy right now", icon: "clock", response: "Totally respect that — I'll keep it to 30 seconds. We pay 20-30% residual every month per patient you refer. No selling, no inventory, no content requirements. You literally just share a link. If that sounds worth a 5-minute call later this week, I'll send you a calendar link. If not, no hard feelings.", tip: "Compress the pitch to one sentence of value + one clear next step. 'Busy' usually means 'you haven't earned my attention yet' — not that they're actually unavailable." },
];

const SCRIPTS = [
  { id: "get-interest", label: "Get Interest", icon: "target", lines: [{ role: "you", text: "Hey [Name] — I came across your page and love what you're building in the [focus] space. Quick question: do your clients ever ask about peptides, weight loss meds, or hormone optimization?" }, { role: "them", text: "(They almost always say yes)" }, { role: "you", text: "That's exactly why I'm reaching out. We run a telehealth platform called Athos — peptides, GLP-1s, the whole clinical wellness stack. We have a referral program that pays 20-30% residual monthly. No selling, no inventory. You just share a link and your audience gets 10% off for life." }, { role: "you", text: "Would it be worth a quick 5-minute call to see if it's a fit?" }] },
  { id: "qualify", label: "Qualify", icon: "clipCheck", lines: [{ role: "you", text: "Awesome — before we dive in, let me ask a couple quick questions so I can tailor this to you:" }, { role: "you", text: "1. How big is your current audience / client base?" }, { role: "you", text: "2. Have you done brand partnerships before? If so, how were they structured?" }, { role: "you", text: "3. Do your clients skew toward optimization / longevity, or more general fitness?" }, { role: "you", text: "4. Are you operating as an individual or under a business entity?" }, { role: "note", text: "Individual = 20% · Company/LLC = 30%. Don't lead with the rate difference — let them self-select, then present the right tier." }] },
  { id: "set-appointment", label: "Set Appointment", icon: "cal", lines: [{ role: "you", text: "This sounds like a great fit. Here's what I'd suggest as next steps:" }, { role: "you", text: "I'll send you a quick onboarding link — takes about 2 minutes. You'll get your own partner code, tracking dashboard, and a digital flyer you can customize." }, { role: "you", text: "Then let's book a 15-minute call this week so I can walk you through the partner portal and answer any questions. What does [Day] at [Time] look like for you?" }, { role: "you", text: "In the meantime, I'll shoot you a one-pager with the commission tiers and how the patient flow works so you can see exactly what your audience would experience." }, { role: "note", text: "Always end with a specific day/time suggestion — don't say 'whenever works.' Reduce friction to one decision." }] },
];

const CLINIC_OBJECTIONS = [
  { id: "have-supplier", label: "We have a supplier", icon: "link", response: "That's great — most of our clinic partners do. They use us as a secondary source for two reasons: supply reliability and liability. If your current supplier runs short on Tirzepatide or BPC, you have a backup. And with our physician network handling the prescribing, your doctors aren't carrying that risk. No exclusivity, no minimums. It's just a safety net that also makes you money.", tip: "Don't compete with their current supplier. Position as backup + liability shield. 'Secondary source' lands better than 'switch to us.'" },
  { id: "liability", label: "Liability concerns", icon: "shield", response: "That's actually exactly why we built this. Your doctors don't prescribe — our licensed physician network handles all of that independently. Your clinic refers the patient, our physicians evaluate and prescribe, our 503(a)/503(b) pharmacies compound and ship. Your team never touches a script pad for these products.", tip: "This is the #1 closer for clinics. Most doctors WANT to offer peptides but won't because of liability. You're removing that barrier entirely." },
  { id: "no-demand", label: "Patients aren't asking", icon: "ban", response: "That's actually pretty common to hear — until the clinic starts offering it. What we've seen is that patients don't ask because they don't know it's available through their doctor. Once you put it on the menu — even just a flyer in the waiting room — demand shows up fast. We handle the rest.", tip: "Patients don't ask for what they don't know exists. The demand is latent. Clinics that add peptides are surprised how fast it picks up." },
  { id: "busy", label: "Too busy right now", icon: "clock", response: "Totally get it. Here's the thing — this adds zero workload to your staff. We handle prescribing, pharmacy, fulfillment, and patient follow-up. Your front desk just hands out a flyer or shares a link. That's it. Can I send you a one-pager so you can look at it when things slow down?", tip: "'Too busy' means 'you haven't shown me this is low effort.' Hit zero workload hard. One-pager gets your foot in the door for later." },
];

const CLINIC_SCRIPTS = [
  { id: "intro-call", label: "Intro Call", icon: "target", lines: [{ role: "you", text: "Hey [Name] — thanks for taking the call. I'll keep this quick. Do your patients ever ask about peptides, GLP-1s, or weight loss medications?" }, { role: "them", text: "(Usually yes, or 'sometimes')" }, { role: "you", text: "That's what I'm hearing from most clinics right now. The problem is most doctors don't want the prescribing liability for compounds they're not deeply familiar with. That's where we come in." }, { role: "you", text: "We have a licensed physician network that handles all the prescribing. Everything ships from our 503(a)/503(b) pharmacies. Your clinic refers the patient, earns revenue, and your doctors never touch a script pad for these products." }, { role: "you", text: "Would it be worth 15 minutes to walk you through how it works?" }] },
  { id: "qualify-clinic", label: "Qualify", icon: "clipCheck", lines: [{ role: "you", text: "Before I walk you through the details, let me ask a few quick questions so I can tailor this to your practice:" }, { role: "you", text: "1. What's your patient volume like — how many patients per week roughly?" }, { role: "you", text: "2. Are you currently offering any peptide or GLP-1 protocols?" }, { role: "you", text: "3. If not, is that a liability concern or just haven't explored it yet?" }, { role: "you", text: "4. Who makes the call on new vendor partnerships — is that you or someone else?" }, { role: "note", text: "Listen for: patient volume (demand potential), current peptide usage (competition or gap), liability concern (your biggest lever), decision maker (are you talking to the right person)." }] },
  { id: "set-appointment-clinic", label: "Set Appointment", icon: "cal", lines: [{ role: "you", text: "I think there's a real fit here. Here's what I'd suggest:" }, { role: "you", text: "I'll send you a link to our product catalog so you can see exactly what we carry and the clinic pricing. Then let's book 15 minutes this week where I can walk you through the portal and answer any questions." }, { role: "you", text: "What does [Day] at [Time] look like?" }, { role: "note", text: "Send the catalog link immediately after the call — don't wait. The longer the gap, the colder the lead. Always propose a specific day/time." }] },
];

const QUEUE_MODES = [
  { id: "all", label: "All" },
  { id: "all-influencers", label: "All Influencers" },
  { id: "influencers", label: "Influencers" },
  { id: "micro", label: "Micro-Influencers" },
  { id: "clinics", label: "Clinics" },
  { id: "consumers", label: "Consumers" },
  { id: "hot", label: "Hot (2:1)" },
  { id: "cooldown", label: "Cooldown (1:3)" },
];

const TAG_OPTIONS = [
  { id: "skool - influencer", label: "Skool Influencer", c: P, modes: ["all", "all-influencers", "influencers", "hot", "cooldown"] },
  { id: "skool - clinic", label: "Skool Clinic", c: "#2563EB", modes: ["all", "all-influencers", "influencers", "clinics"] },
  { id: "skool - consumer", label: "Skool Consumer", c: TEAL, modes: ["all", "consumers", "micro", "hot", "cooldown"] },
  { id: "skool - admin", label: "Skool Admin", c: "#D97706", modes: ["all", "all-influencers", "influencers", "micro", "clinics", "consumers", "hot", "cooldown"] },
  { id: "instagram", label: "Instagram", c: "#E1306C", modes: ["all", "all-influencers", "influencers", "micro", "clinics", "consumers", "hot", "cooldown"] },
  { id: "comments", label: "Comments", c: "#8B5CF6", modes: ["all", "consumers", "micro", "hot", "cooldown"] },
  { id: "clinic", label: "Clinic", c: "#2563EB", modes: ["all", "clinics"] },
  { id: "ca", label: "CA", c: "#991B1B", modes: ["all", "all-influencers", "influencers", "micro", "clinics", "consumers", "hot", "cooldown"] },
];

const getTags = (it) => {
  const v = it?.fields?.tags;
  if (!v) return [];
  if (Array.isArray(v)) return v.map(t => typeof t === "object" ? (t.label || t.name || "") : String(t)).filter(Boolean);
  if (typeof v === "object" && v !== null) return [v.label || v.name || ""].filter(Boolean);
  if (typeof v === "string") return v.split(",").map(s => s.trim()).filter(Boolean);
  return [];
};

/* ── Helpers ────────────────────────────────────────────────── */
const fmtF = (v) => { if (!v && v !== 0) return "—"; const s = String(v).replace(/[~,\s]/g, "").trim(); const m = s.match(/^(\d+\.?\d*)\s*([kKmM]?)$/); if (m) { let num = parseFloat(m[1]); const sfx = m[2].toLowerCase(); if (sfx === "k") num *= 1000; if (sfx === "m") num *= 1000000; if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`; if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}K`; return num.toLocaleString(); } const n = parseInt(s, 10); if (isNaN(n)) return String(v); if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`; if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`; return n.toLocaleString(); };
const stObj = (id) => { const lower = (id || "").toLowerCase().trim(); return STATUSES.find(s => s.id.toLowerCase() === lower) || STATUSES[0]; };
const fmtDate = () => { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}-${String(d.getFullYear()).slice(-2)}`; };

const sortByStatus = (a, b) => { const pa = STATUS_PRIORITY[stObj(a.fields.status || "New Lead").id] ?? 99; const pb = STATUS_PRIORITY[stObj(b.fields.status || "New Lead").id] ?? 99; if (pa !== pb) return pa - pb; const na = (a.fields.name || a.fields.handle || "").toLowerCase(); const nb = (b.fields.name || b.fields.handle || "").toLowerCase(); return na.localeCompare(nb); };

const queueFilter = (it) => {
  if ((it.fields.status || "").trim() === "Look-up Info") return true;
  if (isClinic(it)) return true;
  if (!hasRep(it.fields.assigned_rep)) return true;
  if (!(it.fields.sales_notes || "").trim()) return true;
  const tc = it.fields.tasks_completed;
  return !tc || tc === "[]" || tc.length < 3;
};

/* ── Icons ──────────────────────────────────────────────────── */
const I = {
  eye: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  send: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>,
  phone: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  phoneOut: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /><path d="M15 3h6v6M21 3l-6.5 6.5" /></svg>,
  mail: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>,
  edit: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  search: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  chk: (c = "#fff", s = 14) => <svg width={s} height={s} fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  chevL: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
  chevR: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  chevD: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
  ext: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>,
  lock: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  shield: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  copy: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>,
  cycle: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></svg>,
  ban: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /></svg>,
  tip: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>,
  msg: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
  zap: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  plus: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>,
  notepad: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>,
  clock: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  link: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>,
  target: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  clipCheck: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>,
  cal: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>,
  bulb: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M9 18h6M10 22h4" /><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" /></svg>,
  x: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" /></svg>,
  pin: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
};

/* ── Shared styles ─────────────────────────────────────────── */
const inp = { width: "100%", fontFamily: FB, fontSize: 15, fontWeight: 500, padding: "10px 14px", borderRadius: 10, border: "2px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", color: PD, outline: "none", boxSizing: "border-box", transition: "border-color .2s" };
const focH = (e) => (e.target.style.borderColor = P);
const blurH = (e) => (e.target.style.borderColor = "rgba(0,0,0,0.08)");
const pill = (active, c) => ({ padding: "6px 14px", borderRadius: 9999, border: `2px solid ${active ? c : "rgba(0,0,0,0.08)"}`, backgroundColor: active ? `${c}12` : "#fff", color: active ? c : "#6B7280", fontSize: 13, fontWeight: 600, fontFamily: FB, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", gap: 6 });
const btnPrimary = (enabled) => ({ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 18px", borderRadius: 10, border: "none", backgroundColor: enabled ? P : "rgba(0,0,0,0.04)", color: enabled ? "#fff" : "#9CA3AF", fontSize: 13, fontWeight: 600, fontFamily: FB, cursor: enabled ? "pointer" : "not-allowed", transition: "all .2s" });
const selectStyle = { ...inp, fontSize: 14, padding: "10px 12px", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" };
const filterSelect = { padding: "7px 32px 7px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, fontFamily: FB, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", outline: "none" };

/* ── AccordionRow — defined outside render ──────────────────── */
const AccordionRow = ({ item, isOpen, toggle, children }) => (
  <div>
    <button className="lq-obj" onClick={toggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)", backgroundColor: isOpen ? "rgba(36,92,58,0.04)" : "transparent", cursor: "pointer", fontFamily: FB, transition: "all .15s" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: isOpen ? PD : "#6B7280" }}><span style={{ color: isOpen ? P : "#9CA3AF" }}>{I[item.icon]}</span>{item.label}</span>
      <span style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", color: "#9CA3AF" }}>{I.chevD}</span>
    </button>
    {isOpen && <div style={{ padding: "12px 12px 14px", margin: "4px 0 0", borderRadius: 10, backgroundColor: "rgba(36,92,58,0.03)", border: "1px solid rgba(36,92,58,0.08)" }}>{children}</div>}
  </div>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Block() {
  const user = useCurrentUser();
  const isAdmin = isAdminUser();
  const { data, status, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecords({ select: readSelect, count: 100 });
  const updateRecord = useRecordUpdate({ fields: writeFields, onError: (err) => toast.error("Save failed", { description: err.message }) });

  /* ── Primary key: lead ID ───────────────────────────────── */
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(() => { try { return sessionStorage.getItem("athos_sf") || "all"; } catch { return "all"; } });
  const [queueMode, setQueueMode] = useState(() => { try { return sessionStorage.getItem("athos_qm") || "influencers"; } catch { return "influencers"; } });

  /* ── Form state ─────────────────────────────────────────── */
  const [done, setDone] = useState(new Set());
  const [leadStatus, setLeadStatus] = useState("New Lead");
  const [editName, setEditName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editFollowers, setEditFollowers] = useState("");
  const [editFocus, setEditFocus] = useState("");
  const [editClinicName, setEditClinicName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editGateKeeper, setEditGateKeeper] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [notes, setNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [adminReviewed, setAdminReviewed] = useState(false);
  const [dripActive, setDripActive] = useState(false);
  const [phoneDispo, setPhoneDispo] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [dmMsgIdx, setDmMsgIdx] = useState(() => { try { return parseInt(sessionStorage.getItem("athos_dm_rr") || "0", 10); } catch { return 0; } });
  const [copied, setCopied] = useState(false);
  const [activeObjId, setActiveObjId] = useState(null);
  const [activeScriptId, setActiveScriptId] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteAction, setNoteAction] = useState("");
  const [noteDetail, setNoteDetail] = useState("");
  const [noteNext, setNoteNext] = useState("");
  const [noteEmail, setNoteEmail] = useState("");
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStep, setCallStep] = useState(1);
  const [callWho, setCallWho] = useState("");
  const [callGkName, setCallGkName] = useState("");
  const [callDetails, setCallDetails] = useState("");
  const [callCustomNote, setCallCustomNote] = useState("");
  const [showNoteTip, setShowNoteTip] = useState(false);
  const [rrCount, setRrCount] = useState(0);
  const [ncDm, setNcDm] = useState(true);
  const [ncCall, setNcCall] = useState(true);
  const [tagFilter, setTagFilter] = useState(new Set());
  const [tagExclude, setTagExclude] = useState(new Set());
  const [contactFilter, setContactFilter] = useState("all");
  const [offerProduct, setOfferProduct] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [confirmedLeadType, setConfirmedLeadType] = useState(null);
  const [emailGatekeeper, setEmailGatekeeper] = useState(false);
  const [emailCatOverride, setEmailCatOverride] = useState(null);


  const lastHydratedId = useRef(null);
  const hydratedFields = useRef({});
  const hydratedStatus = useRef("New Lead");

  /* ── Persist session ────────────────────────────────────── */
  useEffect(() => { try { sessionStorage.setItem("athos_sf", statusFilter); } catch {} }, [statusFilter]);
  useEffect(() => { try { sessionStorage.setItem("athos_qm", queueMode); } catch {} }, [queueMode]);

  const allRecords = data?.pages.flatMap(p => p.items) ?? [];

  /* Pipeline: queueFilter → tag filter → status filter → bucket → sort → interleave */
  const filtered = statusFilter !== "all" ? allRecords : allRecords.filter(queueFilter);
  const tagFiltered = (() => {
    let result = filtered;
    if (tagFilter.size > 0) result = result.filter(it => { const t = getTags(it); return t.some(tag => tagFilter.has(tag.toLowerCase())); });
    if (tagExclude.size > 0) result = result.filter(it => { const t = getTags(it); return !t.some(tag => tagExclude.has(tag.toLowerCase())); });
    return result;
  })();
  const contactFiltered = contactFilter === "all" ? tagFiltered : tagFiltered.filter(it => {
    const la = it.fields.last_activity;
    if (!la) return contactFilter === "never";
    if (contactFilter === "never") return false;
    const hrs = (Date.now() - new Date(la).getTime()) / 3600000;
    switch (contactFilter) {
      case "15m": return hrs <= 0.25;
      case "1h": return hrs <= 1;
      case "12h": return hrs <= 12;
      case "24h": return hrs <= 24;
      case "3d": return hrs <= 72;
      case "7d": return hrs <= 168;
      case "not-24h": return hrs > 24;
      case "not-3d": return hrs > 72;
      case "not-7d": return hrs > 168;
      case "not-10d": return hrs > 240;
      case "never": return false;
      default: return true;
    }
  });
  const statusFiltered = statusFilter !== "all" ? contactFiltered.filter(it => stObj(it.fields.status || "New Lead").id === statusFilter) : contactFiltered;

  let filteredQueue;
  if (queueMode === "consumers") filteredQueue = statusFiltered.filter(it => isConsumer(it) && !isMicro(it)).sort(sortByStatus);
  else if (queueMode === "micro") filteredQueue = statusFiltered.filter(isMicro).sort(sortByStatus);
  else if (queueMode === "clinics") filteredQueue = statusFiltered.filter(isClinic).sort(sortByStatus);
  else if (queueMode === "all-influencers") filteredQueue = statusFiltered.filter(it => !isConsumer(it) || isMicro(it)).sort(sortByStatus);
  else if (queueMode === "influencers") filteredQueue = statusFiltered.filter(it => !isConsumer(it) && !isClinic(it)).sort(sortByStatus);
  else if (queueMode === "hot" || queueMode === "cooldown") {
    const cSorted = statusFiltered.filter(it => isConsumer(it) && !isMicro(it) && !isClinic(it)).sort(sortByStatus);
    const iSorted = statusFiltered.filter(it => (!isConsumer(it) || isMicro(it)) && !isClinic(it)).sort(sortByStatus);
    const [cr, ir] = queueMode === "hot" ? [2, 1] : [1, 3];
    const result = []; let ci = 0, ii = 0;
    while (ci < cSorted.length || ii < iSorted.length) {
      for (let c = 0; c < cr && ci < cSorted.length; c++) result.push(cSorted[ci++]);
      for (let i = 0; i < ir && ii < iSorted.length; i++) result.push(iSorted[ii++]);
    }
    filteredQueue = result;
  }
  else filteredQueue = statusFiltered.sort(sortByStatus);

  const pagesLoading = hasNextPage || isFetchingNextPage;
  const lead = pagesLoading ? null : (activeLeadId ? allRecords.find(it => it.id === activeLeadId) || null : filteredQueue[0] || null);
  const queueIdx = lead ? filteredQueue.findIndex(it => it.id === lead.id) : -1;
  const total = filteredQueue.length;

  const leadIsConsumer = lead ? (confirmedLeadType ? (confirmedLeadType === "consumer" || confirmedLeadType === "micro-influencer") : isConsumer(lead)) : false;
  const leadIsMicro = lead ? (confirmedLeadType ? confirmedLeadType === "micro-influencer" : isMicro(lead)) : false;
  const leadIsClinic = lead ? (confirmedLeadType ? confirmedLeadType === "clinic" : isClinic(lead)) : false;

  /* ── Auto-paginate until all records loaded ───────────────── */
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [data, hasNextPage, isFetchingNextPage]);

  /* ── Hydration: ONLY when lead ID changes ───────────────── */
  useEffect(() => {
    if (!lead) return;
    if (lead.id === lastHydratedId.current) return;
    lastHydratedId.current = lead.id;
    if (lead.id !== activeLeadId) setActiveLeadId(lead.id);
    const f = lead.fields;
    setLeadStatus(f.status || "New Lead");
    hydratedStatus.current = f.status || "New Lead";
    setEditName(f.name || ""); setEditHandle((f.handle || "").replace("@", ""));
    setEditFollowers(String(f.followers || "")); setEditFocus(f.focus || "");
    setEditClinicName(f.clinic_name || ""); setEditAddress(f.address || ""); setEditGateKeeper(f.gate_keeper || "");
    setPhone1(f.phone_1 || ""); setPhone2(f.phone_2 || ""); setEmailVal(f.email || "");
    setNotes(f.sales_notes || ""); setAdminNotes(f.admin_notes || "");
    setAdminReviewed(!!f.admin_reviewed); setDripActive(!!f.email_drip_active);
    setClaimed(hasRep(f.assigned_rep)); setCopied(false); setPhoneDispo(null);
    setNcDm(true); setNcCall(true);
    setOfferProduct(false);
    setShowTypeMenu(false);
    setConfirmedLeadType(null);
    setEmailGatekeeper(false);
    setEmailCatOverride(null);
    setShowCallModal(false); setCallStep(1); setCallWho(""); setCallGkName(""); setCallDetails(""); setCallCustomNote("");
    hydratedFields.current = { name: f.name || "", handle: (f.handle || "").replace("@", ""), followers: String(f.followers || ""), focus: f.focus || "", phone_1: f.phone_1 || "", phone_2: f.phone_2 || "", email: f.email || "", clinic_name: f.clinic_name || "", address: f.address || "", gate_keeper: f.gate_keeper || "" };
    try {
      const parsed = new Set(JSON.parse(f.tasks_completed || "[]"));
      if ((f.status || "").trim() === "Look-up Info") ["lookup_info", "lookup_phone", "add_phone_2", "lookup_email"].forEach(id => parsed.delete(id));
      if ((f.status || "").trim() === "Next Contact") { const ncIds = isClinic(lead) ? new Set(["call", "call_2", "send_email", "notes"]) : new Set(["nudge", "call", "notes"]); [...parsed].forEach(id => { if (!ncIds.has(id)) parsed.delete(id); }); }
      setDone(parsed);
    } catch { setDone(new Set()); }
  }, [activeLeadId, lead?.id]);

  /* ── Loading / Error ──────────────────────────────────────── */
  if (status === "pending" || pagesLoading) return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB }}>
      <div style={{ textAlign: "center" }}><div style={{ width: 44, height: 44, border: "3px solid rgba(36,92,58,0.12)", borderTopColor: P, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} /><p style={{ color: "#6B7280", fontSize: 14 }}>Loading queue{allRecords.length > 0 ? ` (${allRecords.length} loaded)` : ""}...</p></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (status === "error") return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}><p style={{ color: "#991B1B", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Failed to load leads</p><p style={{ color: "#6B7280", fontSize: 14 }}>Check that the datasource is connected in Studio and all field IDs are valid.</p></div>
    </div>
  );
  if (!lead && activeLeadId) return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB }}>
      <div style={{ textAlign: "center" }}><div style={{ width: 44, height: 44, border: "3px solid rgba(36,92,58,0.12)", borderTopColor: P, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} /><p style={{ color: "#6B7280", fontSize: 14 }}>Loading lead...</p></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!lead) {
    if (tagFilter.size > 0 || tagExclude.size > 0 || contactFilter !== "all" || statusFilter !== "all") {
      /* Empty results with active filters — keep UI so user can adjust */
    } else {
      return (<div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB }}><p style={{ color: "#6B7280", fontSize: 16 }}>No leads in queue.</p></div>);
    }
  }

  /* ── Derived ──────────────────────────────────────────────── */
  const f = lead?.fields || {};
  const handle = editHandle;
  const so = stObj(leadStatus);
  const nameParts = editName.trim().split(/\s+/);
  const firstName = nameParts[0] || handle || "there";
  const fullName = editName || "";
  const focusLabel = editFocus || "wellness";
  const userLink = user ? [{ id: user.id, label: user.fullName || user.firstName || "Rep" }] : [];
  const noteLines = notes ? notes.split("\n").filter(l => l.trim()) : [];
  const consumerTopic = topicPhrase(f?.consumer_note);

  /* DM template selection */
  const dmTemplates = leadIsMicro ? MICRO_DM_TEMPLATES : leadIsConsumer ? CONSUMER_DM_TEMPLATES : offerProduct ? INFLUENCER_PRODUCT_DM_TEMPLATES : DM_TEMPLATES;
  const dmMsg = dmTemplates[dmMsgIdx % dmTemplates.length].replace("{first}", firstName).replace("{focus}", focusLabel).replace("{topic}", consumerTopic);
  const nudgeMsg = NUDGE_TEMPLATES[dmMsgIdx % NUDGE_TEMPLATES.length].replace("{first}", firstName);

  /* Task branching */
  const isNC = leadStatus === "Next Contact";
  const baseTasks = isNC ? (leadIsClinic ? CLINIC_NC_TASKS : NC_TASKS.filter(t => {
    if (t.ncToggle === "dm") return ncDm;
    if (t.ncToggle === "call") return ncCall;
    return true;
  })) : leadIsConsumer ? CONSUMER_TASKS : leadIsClinic ? CLINIC_TASKS : TASKS;
  const NON_CALLABLE = ["no info found", "multiple records"];
  const visibleTasks = baseTasks.filter(t => {
    if (t.cond === "phone_1") { const ph = phone1.trim().toLowerCase(); return ph && !NON_CALLABLE.includes(ph); }
    if (t.cond === "phone_2") { const ph = phone2.trim().toLowerCase(); return ph && !NON_CALLABLE.includes(ph); }
    if (t.statusCond && hydratedStatus.current !== t.statusCond) return false;
    if (t.type === "nudge" && !lead?.fields?.last_activity) return false;
    if (t.type === "input" && t.field) {
      const v = ((t.field === "phone_1" ? hydratedFields.current.phone_1 : t.field === "phone_2" ? hydratedFields.current.phone_2 : t.field === "email" ? hydratedFields.current.email : t.field === "name" ? hydratedFields.current.name : "") || "").trim();
      if (v) return false;
    }
    return true;
  });
  const activeTaskId = visibleTasks.find(t => !done.has(t.id))?.id || null;
  const allDone = visibleTasks.every(t => done.has(t.id));
  const progress = visibleTasks.length > 0 ? [...done].filter(id => visibleTasks.some(t => t.id === id)).length / visibleTasks.length : 0;

  /* Status list branching */
  const visibleStatuses = leadIsConsumer ? STATUSES.filter(s => CONSUMER_STATUS_IDS.includes(s.id)) : STATUSES;

  /* Contact dirty */
  const contactDirty = editName.trim() !== hydratedFields.current.name || editHandle.trim() !== hydratedFields.current.handle || editFollowers.trim() !== hydratedFields.current.followers || editFocus.trim() !== hydratedFields.current.focus || phone1.trim() !== hydratedFields.current.phone_1 || phone2.trim() !== hydratedFields.current.phone_2 || emailVal.trim() !== hydratedFields.current.email || editClinicName.trim() !== hydratedFields.current.clinic_name || editAddress.trim() !== hydratedFields.current.address || editGateKeeper.trim() !== hydratedFields.current.gate_keeper;

  const saveContactInfo = async () => {
    try {
      await updateRecord.mutateAsync({ recordId: lead.id, fields: { name: editName.trim(), handle: editHandle.trim(), followers: editFollowers.trim(), focus: editFocus.trim(), phone_1: phone1.trim(), phone_2: phone2.trim(), email: emailVal.trim(), clinic_name: editClinicName.trim(), address: editAddress.trim(), gate_keeper: editGateKeeper.trim() } });
      hydratedFields.current = { name: editName.trim(), handle: editHandle.trim(), followers: editFollowers.trim(), focus: editFocus.trim(), phone_1: phone1.trim(), phone_2: phone2.trim(), email: emailVal.trim(), clinic_name: editClinicName.trim(), address: editAddress.trim(), gate_keeper: editGateKeeper.trim() };
      toast.success("Contact info saved");
    } catch (err) { toast.error("Save failed", { description: err.message }); }
  };

  /* ── Actions ──────────────────────────────────────────────── */
  const saveLead = (fields) => { if (lead) updateRecord.mutate({ recordId: lead.id, fields }); };

  const goNext = () => { const ni = Math.min((queueIdx >= 0 ? queueIdx : 0) + 1, filteredQueue.length - 1); if (filteredQueue[ni]) { lastHydratedId.current = null; setActiveLeadId(filteredQueue[ni].id); } };
  const goPrev = () => { const pi = Math.max((queueIdx >= 0 ? queueIdx : 0) - 1, 0); if (filteredQueue[pi]) { lastHydratedId.current = null; setActiveLeadId(filteredQueue[pi].id); } };
  const selectLead = (id) => { if (id !== activeLeadId) { lastHydratedId.current = null; setActiveLeadId(id); } };

  /* ── Round robin next-lead picker ────────────────────────── */
  const getNextRRId = () => {
    if (queueMode !== "hot" && queueMode !== "cooldown") {
      return (queueIdx >= 0 && queueIdx < filteredQueue.length - 1) ? filteredQueue[queueIdx + 1].id : filteredQueue[0]?.id;
    }
    const cl = queueMode === "hot" ? 3 : 4;
    const pos = rrCount % cl;
    const wantConsumer = queueMode === "hot" ? pos < 2 : pos < 1;
    const bucket = wantConsumer
      ? filteredQueue.filter(it => isConsumer(it) && !isMicro(it) && !isClinic(it) && it.id !== lead.id)
      : filteredQueue.filter(it => (!isConsumer(it) || isMicro(it)) && !isClinic(it) && it.id !== lead.id);
    const fallback = filteredQueue.find(it => it.id !== lead.id);
    setRrCount(prev => prev + 1);
    return bucket[0]?.id || fallback?.id;
  };

  const openIG = () => {
    window.open(`https://instagram.com/${handle}`, "_blank");
    const nextDone = new Set(done).add("view_profile");
    setDone(nextDone);
    if (user?.id && !claimed) { setClaimed(true); saveLead({ assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) }); }
    else saveLead({ tasks_completed: JSON.stringify([...nextDone]) });
  };

  const markDone = (id) => { const nextDone = new Set(done).add(id); setDone(nextDone); if (visibleTasks.every(t => nextDone.has(t.id))) { handleSubmit(notes, nextDone); } else { saveLead({ tasks_completed: JSON.stringify([...nextDone]) }); } };

  const markNoInfo = () => {
    const nextDone = new Set(done); ["lookup_info", "lookup_phone", "add_phone_2", "lookup_email"].forEach(id => nextDone.add(id));
    setDone(nextDone); setLeadStatus("cold"); setClaimed(true);
    saveLead({ status: "cold", assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) });
    toast("Lead marked cold");
  };

  const searchG = (qy) => window.open(`https://www.google.com/search?q=${encodeURIComponent(qy)}`, "_blank");
  const copyDM = async () => { try { await navigator.clipboard.writeText(dmMsg); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { toast.error("Copy failed"); } };
  const cycleDM = () => { const next = (dmMsgIdx + 1) % dmTemplates.length; setDmMsgIdx(next); setCopied(false); try { sessionStorage.setItem("athos_dm_rr", String(next)); } catch {} };

  const addNote = async () => {
    if (!noteAction) { toast.error("Select what happened"); return; }
    const emailPart = noteEmail.trim() ? ` // EMAIL: ${noteEmail.trim().toUpperCase()}` : "";
    const line = `${fmtDate()} // ${noteAction.toUpperCase()} // ${(noteDetail || "—").toUpperCase()} // ${(noteNext || "—").toUpperCase()}${emailPart}`;
    const updated = notes ? `${line}\n${notes}` : line;
    const nextDone = new Set(done).add("notes");
    const wouldBeAllDone = visibleTasks.every(t => nextDone.has(t.id));
    if (wouldBeAllDone) {
      setNotes(updated); setDone(nextDone); setClaimed(true);
      if (noteEmail.trim()) { setEmailVal(noteEmail.trim()); }
      const statusOverride = (noteNext === "Send Info" || noteNext === "Call Back") ? "Next Contact" : null;
      if (statusOverride) setLeadStatus(statusOverride);
      setShowNoteModal(false); setNoteAction(""); setNoteDetail(""); setNoteNext(""); setNoteEmail("");
      handleSubmit(updated, nextDone, statusOverride);
    } else {
      try {
        const saveFields = { sales_notes: updated, assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) };
        if (noteEmail.trim()) { saveFields.email = noteEmail.trim(); setEmailVal(noteEmail.trim()); }
        if (noteNext === "Send Info" || noteNext === "Call Back") { saveFields.status = "Next Contact"; setLeadStatus("Next Contact"); }
        await updateRecord.mutateAsync({ recordId: lead.id, fields: saveFields });
        setNotes(updated); setDone(nextDone); setClaimed(true);
        setShowNoteModal(false); setNoteAction(""); setNoteDetail(""); setNoteNext(""); setNoteEmail("");
        toast.success("Note added");
      } catch (err) { toast.error("Failed to save note", { description: err.message }); }
    }
  };

  /* Consumer Private DM — one click close-out */
  const completeCall = (outcome, nextStep, statusChange) => {
    const custom = callCustomNote.trim();
    const noteLine = `${fmtDate()} // CALLED // ${outcome.toUpperCase()} // ${nextStep.toUpperCase()}${custom ? ` // ${custom.toUpperCase()}` : ""}`;
    const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine;
    const nextDone = new Set(done).add(activeTaskId || "call");
    if (activeTaskId === "call" && !outcome.startsWith("N/A") && !outcome.startsWith("VM") && !outcome.startsWith("WRONG")) nextDone.add("call_2");
    setNotes(updatedNotes); setDone(nextDone); setClaimed(true);
    const fields = { sales_notes: updatedNotes, assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) };
    if (statusChange) { fields.status = statusChange; setLeadStatus(statusChange); }
    if (callGkName.trim()) { fields.gate_keeper = callGkName.trim(); setEditGateKeeper(callGkName.trim()); }
    saveLead(fields);
    setShowCallModal(false); setCallStep(1); setCallWho(""); setCallGkName(""); setCallDetails(""); setCallCustomNote("");
  };

  const handlePrivateDM = () => {
    if (leadIsConsumer) {
      const nextId = getNextRRId();
      const noteLine = `${fmtDate()} // CLOSED PRIVATE DM`;
      const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine;
      const nextDone = new Set(done); nextDone.add("send_dm"); nextDone.add("notes");
      updateRecord.mutate(
        { recordId: lead.id, fields: { status: "cold", sales_notes: updatedNotes, assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) } },
        { onSuccess: () => { toast("Private — marked cold"); lastHydratedId.current = null; if (nextId) setActiveLeadId(nextId); }, onError: (err) => { toast.error("Save failed", { description: err.message }); } }
      );
    } else {
      const noteLine = `${fmtDate()} // PRIVATE DM`;
      const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine;
      setNotes(updatedNotes); markDone("send_dm");
      saveLead({ sales_notes: updatedNotes });
    }
  };

  const handleSubmit = (overrideNotes, overrideDone, overrideStatus) => {
    const eDone = overrideDone || done;
    const eNotes = overrideNotes !== undefined ? overrideNotes : notes;
    const eAllDone = visibleTasks.every(t => eDone.has(t.id));
    if (!eAllDone) { toast.error("Complete all tasks first"); return; }
    if (!user?.id) { toast.error("You must be logged in"); return; }
    setSubmitting(true);
    let finalStatus = overrideStatus || leadStatus;
    if (leadIsConsumer) { if (finalStatus === "New Lead") finalStatus = "messaged"; }
    else { if (!phone1.trim() && phoneDispo !== "intl") finalStatus = "Look-up Info"; }
    if (finalStatus !== leadStatus) { setLeadStatus(finalStatus); if (finalStatus === "Look-up Info") toast("No contact info — status set to Look-up Info"); }
    const nextId = getNextRRId();
    const fields = { name: editName.trim(), handle: editHandle.trim(), followers: editFollowers.trim(), focus: editFocus.trim(), status: finalStatus, assigned_rep: userLink, phone_1: phone1.trim(), phone_2: phone2.trim(), email: emailVal.trim(), sales_notes: eNotes.trim(), tasks_completed: JSON.stringify([...eDone]), email_drip_active: dripActive, clinic_name: editClinicName.trim(), address: editAddress.trim(), gate_keeper: editGateKeeper.trim() };
    if (isAdmin) { fields.admin_reviewed = adminReviewed; fields.admin_notes = adminNotes.trim(); }
    updateRecord.mutate({ recordId: lead.id, fields }, {
      onSuccess: () => { toast.success("Lead submitted"); setSubmitting(false); lastHydratedId.current = null; if (nextId) setActiveLeadId(nextId); },
      onError: (err) => { toast.error("Submit failed", { description: err.message }); setSubmitting(false); },
    });
  };

  /* ── Task row ──────────────────────────────────────────── */
  const renderTask = (task) => {
    const isDone = done.has(task.id), isActive = task.id === activeTaskId, isLocked = !isDone && !isActive;
    const cc = isDone ? P : isActive ? P : "rgba(0,0,0,0.12)";
    const getVal = () => task.field === "email" ? emailVal : task.field === "phone_2" ? phone2 : task.field === "name" ? editName : phone1;
    const setVal = (v) => task.field === "email" ? setEmailVal(v) : task.field === "phone_2" ? setPhone2(v) : task.field === "name" ? setEditName(v) : setPhone1(v);
    const placeholder = task.field === "email" ? "Enter email if found" : task.field === "phone_2" ? "Secondary phone" : task.field === "name" ? "Enter their name" : "Enter phone if found";
    const searchQuery = `${editName} ${editFocus || ""} ${task.field === "email" ? "email contact" : "phone number"}`;
    const isPh = task.field === "phone_1" || task.field === "phone_2";
    const isName = task.field === "name";

    const undoTask = () => { const nextDone = new Set(done); nextDone.delete(task.id); setDone(nextDone); saveLead({ tasks_completed: JSON.stringify([...nextDone]) }); };

    return (
      <div key={task.id} style={{ padding: "12px 16px", borderRadius: 14, backgroundColor: isActive ? "rgba(36,92,58,0.03)" : "transparent", opacity: isLocked ? 0.4 : 1, transition: "all .25s", borderLeft: `3px solid ${isActive ? P : "transparent"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: isDone ? "pointer" : "default" }} onClick={isDone ? undoTask : undefined}>
          <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, border: `2px solid ${cc}`, backgroundColor: isDone ? P : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>{isDone ? I.chk() : isLocked ? <span style={{ color: "rgba(0,0,0,0.2)" }}>{I.lock}</span> : <span style={{ color: P }}>{I[task.icon]}</span>}</span>
          <span style={{ flex: 1, fontSize: 15, fontWeight: isDone ? 400 : 600, color: isDone ? "#9CA3AF" : PD, textDecoration: isDone ? "line-through" : "none" }}>{task.label}</span>
          {isDone && <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Undo</span>}
        </div>

        {isActive && task.type === "link" && (<div style={{ marginTop: 10, marginLeft: 38 }}><button onClick={openIG} style={{ ...btnPrimary(true), gap: 8 }}>Open @{handle} {I.ext}</button></div>)}

        {isActive && task.type === "dm" && (
          <div style={{ marginTop: 10, marginLeft: 38, display: "flex", flexDirection: "column", gap: 10 }}>
            {leadIsConsumer && f.consumer_note && (
              <div style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: "rgba(22,98,95,0.06)", border: "1px solid rgba(22,98,95,0.12)", fontSize: 13, color: TEAL }}>
                <span style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em" }}>Comment topic:</span> {consumerTopic}
              </div>
            )}
            {leadIsConsumer && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={async () => {
                  const next = leadIsMicro ? "Consumer" : "Micro-Influencer";
                  const tid = toast.loading(`Changing to ${next}...`);
                  try {
                    await updateRecord.mutateAsync({ recordId: lead.id, fields: { lead_type: next } });
                    setConfirmedLeadType(next.toLowerCase());
                    setDmMsgIdx(0); setCopied(false);
                    toast.success(next === "Micro-Influencer" ? "Marked as Micro-Influencer" : "Reverted to Consumer", { id: tid });
                  } catch (err) { toast.error("Save failed", { id: tid, description: err.message }); }
                }} style={{ ...pill(leadIsMicro, "#D97706"), padding: "6px 14px", fontSize: 12 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: leadIsMicro ? "#D97706" : "rgba(0,0,0,0.12)" }} />
                  Micro-Influencer
                </button>
              </div>
            )}
            {!leadIsConsumer && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => {
                  setOfferProduct(!offerProduct);
                  setDmMsgIdx(0);
                  setCopied(false);
                }} style={{ ...pill(offerProduct, "#D97706"), padding: "6px 14px", fontSize: 12 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: offerProduct ? "#D97706" : "rgba(0,0,0,0.12)" }} />
                  Offer product
                </button>
              </div>
            )}
            <div style={{ padding: 14, borderRadius: 12, backgroundColor: "rgba(36,92,58,0.04)", border: "1px solid rgba(36,92,58,0.1)", fontSize: 14, lineHeight: 1.6, color: PD }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Template {(dmMsgIdx % dmTemplates.length) + 1} of {dmTemplates.length}</span>
                <button onClick={cycleDM} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", color: "#6B7280", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: FB }}>{I.cycle} Next</button>
              </div>{dmMsg}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={copyDM} style={{ ...btnPrimary(true), gap: 6, backgroundColor: copied ? "#059669" : P }}>{copied ? <>{I.chk("#fff", 13)} Copied</> : <>{I.copy} Copy message</>}</button>
              <button onClick={async () => {
                const next = (dmMsgIdx + 1) % dmTemplates.length; setDmMsgIdx(next); try { sessionStorage.setItem("athos_dm_rr", String(next)); } catch {}
                if (leadIsConsumer) {
                  const nextId = getNextRRId();
                  const noteLine = `${fmtDate()} // SENT DM // CONSUMER OUTREACH // FOLLOW UP DM`;
                  const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine;
                  const nextDone = new Set(done); nextDone.add("send_dm"); nextDone.add("notes");
                  updateRecord.mutate(
                    { recordId: lead.id, fields: { status: "messaged", sales_notes: updatedNotes, assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) } },
                    { onSuccess: () => { toast.success("DM sent — next lead"); lastHydratedId.current = null; if (nextId) setActiveLeadId(nextId); }, onError: (err) => { toast.error("Save failed", { description: err.message }); } }
                  );
                } else { markDone("send_dm"); }
              }} style={btnPrimary(true)}>Confirm sent</button>
              <button onClick={handlePrivateDM} style={{ ...pill(false, "#6B7280"), padding: "10px 16px", fontSize: 13 }}>{I.lock} Private</button>
            </div>
          </div>
        )}

        {isActive && task.type === "nudge" && !leadIsClinic && (
          <div style={{ marginTop: 10, marginLeft: 38, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ padding: 14, borderRadius: 12, backgroundColor: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.15)", fontSize: 14, lineHeight: 1.6, color: PD }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: ".04em" }}>Nudge {(dmMsgIdx % NUDGE_TEMPLATES.length) + 1} of {NUDGE_TEMPLATES.length}</span>
                <button onClick={cycleDM} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", color: "#6B7280", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: FB }}>{I.cycle} Next</button>
              </div>{nudgeMsg}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={async () => { try { await navigator.clipboard.writeText(nudgeMsg); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { toast.error("Copy failed"); } }} style={{ ...btnPrimary(true), gap: 6, backgroundColor: copied ? "#059669" : P }}>{copied ? <>{I.chk("#fff", 13)} Copied</> : <>{I.copy} Copy message</>}</button>
              <button onClick={() => {
                const noteLine = `${fmtDate()} // NUDGE SENT // FOLLOW UP // FOLLOW UP DM`;
                const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine;
                const nextDone = new Set(done); nextDone.add("nudge");
                setNotes(updatedNotes); setDone(nextDone);
                if (isNC || leadIsConsumer) {
                  nextDone.add("notes");
                  const nextId = getNextRRId();
                  updateRecord.mutate(
                    { recordId: lead.id, fields: { sales_notes: updatedNotes, assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) } },
                    { onSuccess: () => { toast.success("Nudge sent — next lead"); lastHydratedId.current = null; if (nextId) setActiveLeadId(nextId); }, onError: (err) => { toast.error("Save failed", { description: err.message }); } }
                  );
                } else {
                  saveLead({ sales_notes: updatedNotes, tasks_completed: JSON.stringify([...nextDone]) });
                  toast.success("Nudge sent");
                }
              }} style={btnPrimary(true)}>Confirm sent</button>
            </div>
          </div>
        )}

        {isActive && task.type === "nudge" && leadIsClinic && (() => {
          const tpl = CLINIC_NUDGE_TEMPLATES[dmMsgIdx % CLINIC_NUDGE_TEMPLATES.length];
          const clinicName = editClinicName.trim() || "your clinic";
          const nameForEmail = (editName || "").trim() || firstName || "there";
          const subj = tpl.subject.replace(/\{first\}/g, firstName).replace(/\{name\}/g, nameForEmail).replace(/\{clinic\}/g, clinicName);
          const body = tpl.body.replace(/\{first\}/g, firstName).replace(/\{name\}/g, nameForEmail).replace(/\{clinic\}/g, clinicName);
          return (
            <div style={{ marginTop: 10, marginLeft: 38, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: ".04em" }}>Email Nudge {(dmMsgIdx % CLINIC_NUDGE_TEMPLATES.length) + 1} of {CLINIC_NUDGE_TEMPLATES.length}</span>
                <button onClick={cycleDM} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", color: "#6B7280", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: FB }}>{I.cycle} Next</button>
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Subject</span>
                  <button onClick={async () => { try { await navigator.clipboard.writeText(subj); toast.success("Subject copied"); } catch { toast.error("Copy failed"); } }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", color: "#6B7280", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: FB }}>{I.copy} Copy</button>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: PD }}>{subj}</div>
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Body</span>
                  <button onClick={async () => { try { await navigator.clipboard.writeText(body); toast.success("Body copied"); } catch { toast.error("Copy failed"); } }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", color: "#6B7280", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: FB }}>{I.copy} Copy</button>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: PD, whiteSpace: "pre-line" }}>{body}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={async () => { try { await navigator.clipboard.writeText(emailVal.trim()); toast.success("Email address copied"); } catch { toast.error("Copy failed"); } }} style={{ ...btnPrimary(true), gap: 6, backgroundColor: emailVal.trim() ? TEAL : "#9CA3AF" }} disabled={!emailVal.trim()}>{I.copy} Copy Email</button>
                <button onClick={() => {
                  const noteLine = `${fmtDate()} // EMAIL NUDGE SENT // FOLLOW UP // FOLLOW UP EMAIL`;
                  const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine;
                  const nextDone = new Set(done); nextDone.add("nudge"); nextDone.add("notes");
                  const nextId = getNextRRId();
                  updateRecord.mutate(
                    { recordId: lead.id, fields: { sales_notes: updatedNotes, assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) } },
                    { onSuccess: () => { toast.success("Email nudge sent — next lead"); lastHydratedId.current = null; if (nextId) setActiveLeadId(nextId); }, onError: (err) => { toast.error("Save failed", { description: err.message }); } }
                  );
                }} style={btnPrimary(true)}>Confirm sent</button>
              </div>
            </div>
          );
        })()}

        {isActive && task.type === "email_outreach" && (() => {
          const autoEmailCat = CLINIC_EMAIL_CATS.find(c => c.statuses.includes(hydratedStatus.current))?.id || "first-touch";
          const emailCat = emailCatOverride || autoEmailCat;
          const variant = emailGatekeeper ? "gatekeeper" : "owner";
          const tpl = CLINIC_EMAIL_TEMPLATES[emailCat][variant];
          const gkName = editGateKeeper.trim() || "there";
          const clinicName = editClinicName.trim() || "your clinic";
          const nameForEmail = (editName || "").trim() || firstName || "there";
          const subj = tpl.subject.replace(/\{first\}/g, firstName).replace(/\{name\}/g, nameForEmail).replace(/\{focus\}/g, focusLabel).replace(/\{gatekeeper\}/g, gkName).replace(/\{clinic\}/g, clinicName);
          const body = tpl.body.replace(/\{first\}/g, firstName).replace(/\{name\}/g, nameForEmail).replace(/\{focus\}/g, focusLabel).replace(/\{gatekeeper\}/g, gkName).replace(/\{clinic\}/g, clinicName);
          const catLabel = CLINIC_EMAIL_CATS.find(c => c.id === emailCat)?.label || emailCat;
          return (
            <div style={{ marginTop: 10, marginLeft: 38, display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Category pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CLINIC_EMAIL_CATS.map(c => (
                  <button key={c.id} onClick={() => setEmailCatOverride(c.id === emailCat && emailCatOverride ? null : c.id)} style={{ ...pill(emailCat === c.id, P), padding: "5px 12px", fontSize: 12 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: emailCat === c.id ? P : "rgba(0,0,0,0.12)" }} />{c.label}
                  </button>
                ))}
              </div>
              {/* Owner / Gatekeeper toggle */}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEmailGatekeeper(false)} style={{ ...pill(!emailGatekeeper, TEAL), padding: "5px 12px", fontSize: 12 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: !emailGatekeeper ? TEAL : "rgba(0,0,0,0.12)" }} />Owner
                </button>
                <button onClick={() => setEmailGatekeeper(true)} style={{ ...pill(emailGatekeeper, "#D97706"), padding: "5px 12px", fontSize: 12 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: emailGatekeeper ? "#D97706" : "rgba(0,0,0,0.12)" }} />Gatekeeper
                </button>
              </div>
              {/* Copy email address */}
              <button onClick={async () => { try { await navigator.clipboard.writeText(emailVal.trim()); toast.success("Email address copied"); } catch { toast.error("Copy failed"); } }} style={{ ...btnPrimary(true), gap: 6, alignSelf: "flex-start", backgroundColor: emailVal.trim() ? P : "#9CA3AF" }} disabled={!emailVal.trim()}>{I.copy} Copy Email</button>
              {/* Subject */}
              <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: "rgba(36,92,58,0.04)", border: "1px solid rgba(36,92,58,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Subject</span>
                  <button onClick={async () => { try { await navigator.clipboard.writeText(subj); toast.success("Subject copied"); } catch { toast.error("Copy failed"); } }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", color: "#6B7280", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: FB }}>{I.copy} Copy</button>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: PD }}>{subj}</div>
              </div>
              {/* Body */}
              <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: "rgba(36,92,58,0.04)", border: "1px solid rgba(36,92,58,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em" }}>Body</span>
                  <button onClick={async () => { try { await navigator.clipboard.writeText(body); toast.success("Body copied"); } catch { toast.error("Copy failed"); } }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", color: "#6B7280", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: FB }}>{I.copy} Copy</button>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: PD, whiteSpace: "pre-line" }}>{body}</div>
              </div>
              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => {
                  const noteLine = `${fmtDate()} // SENT EMAIL // ${catLabel.toUpperCase()} // FOLLOW UP`;
                  const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine;
                  const nextDone = new Set(done).add("send_email");
                  setNotes(updatedNotes); setDone(nextDone); setClaimed(true);
                  saveLead({ sales_notes: updatedNotes, assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) });
                }} style={btnPrimary(true)}>Confirm sent</button>
                <button onClick={() => markDone("send_email")} style={{ ...pill(false, "#6B7280"), padding: "8px 16px", fontSize: 13 }}>Skip</button>
              </div>
            </div>
          );
        })()}

        {isActive && task.type === "info" && (
          <div style={{ marginTop: 10, marginLeft: 38, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ padding: 14, borderRadius: 12, backgroundColor: "rgba(36,92,58,0.04)", border: "1px solid rgba(36,92,58,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}><span style={{ color: TEAL }}>{I.tip}</span><span style={{ fontSize: 12, fontWeight: 600, color: TEAL, textTransform: "uppercase", letterSpacing: ".04em" }}>Where to find contact info</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: "#4B5563" }}><span style={{ fontWeight: 600, color: PD }}>1.</span> <span style={{ fontWeight: 600 }}>Google B2B</span> — find their business, then look up that phone number.</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: "#4B5563" }}><span style={{ fontWeight: 600, color: PD }}>2.</span> Check <span style={{ fontWeight: 600 }}>Instagram bio</span> and <span style={{ fontWeight: 600 }}>Linktree</span> for contact/booking links.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => searchG(`${fullName} ${focusLabel} phone contact`)} style={{ ...pill(false, P), padding: "8px 14px", fontSize: 13 }}>Google {I.ext}</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
              <button onClick={() => markDone("lookup_info")} style={btnPrimary(true)}>Got it, continue</button>
              <button onClick={markNoInfo} style={{ ...pill(false, "#991B1B"), padding: "10px 16px", fontSize: 13, gap: 6 }}>{I.ban} No Info Available — Mark Cold</button>
            </div>
          </div>
        )}

        {isActive && task.type === "input" && (
          <div style={{ marginTop: 10, marginLeft: 38, display: "flex", flexDirection: "column", gap: 8 }}>
            {!isName && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => searchG(searchQuery)} style={{ ...pill(false, P), padding: "8px 14px", fontSize: 13 }}>Search Google {I.ext}</button>
            </div>}
            <input style={inp} placeholder={placeholder} value={getVal()} onChange={e => setVal(e.target.value)} onFocus={focH} onBlur={blurH} />
            {isPh && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => { if (task.field === "phone_1") setPhoneDispo("intl"); const noteLine = `${fmtDate()} // SENT DM // INTL DM ONLY // FOLLOW UP DM`; const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine; setNotes(updatedNotes); const nextDone = new Set(done).add(task.id); nextDone.add("call"); nextDone.add("notes"); setDone(nextDone); saveLead({ sales_notes: updatedNotes, tasks_completed: JSON.stringify([...nextDone]) }); }} style={{ ...pill(false, "#D97706"), padding: "5px 10px", fontSize: 12 }}>International</button>
              <button onClick={() => { if (task.field === "phone_1") setPhoneDispo("no_info"); const noteLine = `${fmtDate()} // SENT DM // NO INFO FOUND RESEARCH REQUIRED // LOOKUP INFO`; const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine; setNotes(updatedNotes); const nextDone = new Set(done).add(task.id); if (task.field === "phone_1") nextDone.add("call"); nextDone.add("notes"); setDone(nextDone); saveLead({ sales_notes: updatedNotes, tasks_completed: JSON.stringify([...nextDone]) }); }} style={{ ...pill(false, "#991B1B"), padding: "5px 10px", fontSize: 12 }}>No Info Found</button>
              <button onClick={() => { if (task.field === "phone_1") setPhoneDispo("multi"); const noteLine = `${fmtDate()} // SENT DM // MULTIPLE RECORDS // VERIFY INFO`; const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine; setNotes(updatedNotes); const nextDone = new Set(done).add(task.id); if (task.field === "phone_1") nextDone.add("call"); nextDone.add("notes"); setDone(nextDone); saveLead({ sales_notes: updatedNotes, tasks_completed: JSON.stringify([...nextDone]) }); }} style={{ ...pill(false, "#6B7280"), padding: "5px 10px", fontSize: 12 }}>Multiple Records</button>
            </div>}
            {!isPh && task.field === "email" && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => { const noteLine = `${fmtDate()} // NO EMAIL FOUND`; const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine; setNotes(updatedNotes); const nextDone = new Set(done).add(task.id); setDone(nextDone); saveLead({ sales_notes: updatedNotes, tasks_completed: JSON.stringify([...nextDone]) }); }} style={{ ...pill(false, "#991B1B"), padding: "5px 10px", fontSize: 12 }}>No Info Found</button>
            </div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { const nextDone = new Set(done).add(task.id); setDone(nextDone); saveLead({ [task.field]: getVal().trim(), tasks_completed: JSON.stringify([...nextDone]) }); }} disabled={!getVal().trim()} style={btnPrimary(!!getVal().trim())}>Save & continue</button>
              {task.skip && <button onClick={() => markDone(task.id)} style={{ ...pill(false, "#6B7280"), padding: "8px 16px", fontSize: 13 }}>Skip</button>}
            </div>
          </div>
        )}

        {isActive && task.type === "call" && (() => { const callNum = task.cond === "phone_2" ? phone2 : phone1; return (<div style={{ marginTop: 10, marginLeft: 38, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => { if (callNum) window.open(`tel:${callNum.replace(/\D/g, "")}`); }} style={{ ...pill(false, P), padding: "10px 16px" }}>Call {callNum} {I.ext}</button>
          <button onClick={() => { setShowCallModal(true); setCallStep(1); setCallWho(""); setCallGkName(""); setCallDetails(""); setCallCustomNote(""); }} style={btnPrimary(true)}>Call completed</button>
          <button onClick={() => { const nextDone = new Set(done).add(task.id).add("notes"); const noteLine = `${fmtDate()} // NEXT CONTACT // NC // CALL BACK`; const updatedNotes = notes ? `${noteLine}\n${notes}` : noteLine; const nextId = getNextRRId(); updateRecord.mutate({ recordId: lead.id, fields: { status: "Next Contact", sales_notes: updatedNotes, assigned_rep: userLink, tasks_completed: JSON.stringify([...nextDone]) } }, { onSuccess: () => { toast("Next Contact — saved"); lastHydratedId.current = null; if (nextId) setActiveLeadId(nextId); }, onError: (err) => { toast.error("Save failed", { description: err.message }); } }); }} style={{ ...pill(false, "#0EA5E9"), padding: "10px 16px", fontSize: 13 }}>{I.clock} Next Contact</button>
          {task.id === "call_2" && <button onClick={() => markDone(task.id)} style={{ ...pill(false, "#6B7280"), padding: "10px 16px", fontSize: 13 }}>Skip</button>}
        </div>); })()}

        {isActive && task.type === "textarea" && (
          <div style={{ marginTop: 10, marginLeft: 38, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => { setShowNoteModal(true); setShowNoteTip(false); }} style={btnPrimary(true)}>{I.plus} Add note</button>
            {notes.trim() && <button onClick={() => markDone("notes")} style={{ ...pill(false, "#6B7280"), padding: "8px 16px", fontSize: 13 }}>Skip — notes exist</button>}
          </div>
        )}
      </div>
    );
  };

  /* ━━ RENDER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: FB }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}
.lq-sb:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.lq-n:hover:not(:disabled){background-color:rgba(36,92,58,0.05)!important}
.lq-obj:hover{background-color:rgba(36,92,58,0.04)!important}`}</style>

      {/* ── Note Modal ── */}
      {showNoteModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setShowNoteModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", padding: 28, fontFamily: FB }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: PD, margin: 0, fontFamily: FH }}>Add Note</h3>
              <button onClick={() => setShowNoteModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", backgroundColor: "rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>{I.x}</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 6 }}>What happened?</label><select value={noteAction} onChange={e => setNoteAction(e.target.value)} style={selectStyle}><option value="">Select action...</option>{NOTE_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
              <div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".04em" }}>More info</label><span style={{ fontSize: 11, color: noteDetail.length > 70 ? "#991B1B" : "#9CA3AF" }}>{noteDetail.length}/75</span></div><input style={inp} placeholder="Brief summary" value={noteDetail} onChange={e => { if (e.target.value.length <= 75) setNoteDetail(e.target.value); }} onFocus={focH} onBlur={blurH} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 6 }}>Next steps</label><select value={noteNext} onChange={e => setNoteNext(e.target.value)} style={selectStyle}><option value="">Select next step...</option>{NOTE_NEXT.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 6 }}>Email (optional — updates email field)</label><input style={inp} placeholder="Enter email if provided" value={noteEmail} onChange={e => setNoteEmail(e.target.value)} onFocus={focH} onBlur={blurH} /></div>
              <div style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: "rgba(36,92,58,0.04)", border: "1px solid rgba(36,92,58,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>Preview</div>
                <p style={{ fontSize: 13, fontFamily: "monospace", color: PD, margin: 0, lineHeight: 1.5, wordBreak: "break-word" }}>{fmtDate()} // {noteAction ? noteAction.toUpperCase() : "ACTION"} // {noteDetail ? noteDetail.toUpperCase() : "DETAILS"} // {noteNext ? noteNext.toUpperCase() : "NEXT STEP"}{noteEmail.trim() ? ` // EMAIL: ${noteEmail.trim().toUpperCase()}` : ""}</p>
              </div>
              <button onClick={addNote} disabled={!noteAction} style={{ ...btnPrimary(!!noteAction), padding: "14px 24px", fontSize: 15, width: "100%", borderRadius: 12 }}>Add Note</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Call Modal ── */}
      {showCallModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setShowCallModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", padding: 28, fontFamily: FB }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: PD, margin: 0, fontFamily: FH }}>Call Outcome</h3>
              <button onClick={() => setShowCallModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", backgroundColor: "rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>{I.x}</button>
            </div>

            {/* Step 1: Did they answer? */}
            {callStep === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Did they answer?</div>
                <button onClick={() => completeCall("N/A", "CALL BACK", null)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center" }}>No Answer</button>
                <button onClick={() => setCallStep(1.5)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: TEAL }}>Voicemail</button>
                <button onClick={() => setCallStep(2)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#2563EB" }}>Answered</button>
              </div>
            )}

            {/* Step 1.5: Voicemail type */}
            {callStep === 1.5 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Voicemail details</div>
                <button onClick={() => completeCall("VM", "FOLLOW UP", null)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center" }}>VM Only</button>
                <button onClick={() => completeCall("VM + SMS", "FOLLOW UP", null)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: TEAL }}>VM + SMS</button>
                <button onClick={() => setCallStep(1)} style={{ ...pill(false, "#6B7280"), width: "100%", justifyContent: "center" }}>Back</button>
              </div>
            )}

            {/* Step 2: Who did you speak to? */}
            {callStep === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Who did you speak to?</div>
                <button onClick={() => { setCallWho("gk"); setCallStep(3); }} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#D97706" }}>Gatekeeper</button>
                <button onClick={() => { setCallWho("dm"); setCallStep(4); }} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#2563EB" }}>Decision Maker</button>
                <button onClick={() => setCallStep(1)} style={{ ...pill(false, "#6B7280"), width: "100%", justifyContent: "center" }}>Back</button>
              </div>
            )}

            {/* Step 3: Gatekeeper outcomes */}
            {callStep === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Gatekeeper outcome</div>
                <input style={inp} placeholder="Gatekeeper name (optional)" value={callGkName} onChange={e => setCallGkName(e.target.value)} onFocus={focH} onBlur={blurH} />
                <input style={{ ...inp, fontSize: 13 }} placeholder="Additional notes (optional)" value={callCustomNote} onChange={e => setCallCustomNote(e.target.value)} onFocus={focH} onBlur={blurH} />
                {(() => { const gk = callGkName.trim() ? callGkName.trim().toUpperCase() : "GATEKEEPER"; return (<>
                  <button onClick={() => completeCall(`SPOKE TO / ${gk} / INTERESTED`, "CALL BACK", null)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center" }}>Interested</button>
                  <button onClick={() => completeCall(`SPOKE TO / ${gk} / SEND INFO`, "FOLLOW UP", null)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#2563EB" }}>Send Info</button>
                  <button onClick={() => completeCall(`SPOKE TO / ${gk} / NOT INTERESTED`, "FOLLOW UP EMAIL", null)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#991B1B" }}>Not Interested</button>
                  <button onClick={() => completeCall(`SPOKE TO / ${gk} / CALL BACK`, "CALL BACK", null)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: TEAL }}>Call Back</button>
                  <button onClick={() => setCallStep(3.5)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#059669" }}>Appointment Set</button>
                </>); })()}
                <button onClick={() => setCallStep(2)} style={{ ...pill(false, "#6B7280"), width: "100%", justifyContent: "center" }}>Back</button>
              </div>
            )}

            {/* Step 3.5: Gatekeeper appointment details */}
            {callStep === 3.5 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Appointment details</div>
                <input style={inp} placeholder="Date, time, notes..." value={callDetails} onChange={e => setCallDetails(e.target.value)} onFocus={focH} onBlur={blurH} />
                <input style={{ ...inp, fontSize: 13 }} placeholder="Additional notes (optional)" value={callCustomNote} onChange={e => setCallCustomNote(e.target.value)} onFocus={focH} onBlur={blurH} />
                {(() => { const gk = callGkName.trim() ? callGkName.trim().toUpperCase() : "GATEKEEPER"; return (
                  <button onClick={() => completeCall(`SPOKE TO / ${gk} / APPOINTMENT SET / ${callDetails.trim().toUpperCase() || "TBD"}`, "COMPLETED", "completed")} disabled={!callDetails.trim()} style={{ ...btnPrimary(!!callDetails.trim()), width: "100%", justifyContent: "center" }}>Confirm Appointment</button>
                ); })()}
                <button onClick={() => setCallStep(3)} style={{ ...pill(false, "#6B7280"), width: "100%", justifyContent: "center" }}>Back</button>
              </div>
            )}

            {/* Step 4: Decision Maker outcomes */}
            {callStep === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Decision Maker outcome</div>
                <input style={{ ...inp, fontSize: 13 }} placeholder="Additional notes (optional)" value={callCustomNote} onChange={e => setCallCustomNote(e.target.value)} onFocus={focH} onBlur={blurH} />
                <button onClick={() => completeCall("SPOKE TO / DM / INTERESTED", "SET APPOINTMENT", "warm")} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center" }}>Interested</button>
                <button onClick={() => completeCall("SPOKE TO / DM / SEND INFO", "FOLLOW UP", null)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#2563EB" }}>Send Info</button>
                <button onClick={() => completeCall("SPOKE TO / DM / BUSY", "CALL BACK", null)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: TEAL }}>Busy</button>
                <button onClick={() => completeCall("NOT INTERESTED", "MARK COLD", "cold")} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#991B1B" }}>Not Interested</button>
                <button onClick={() => completeCall("SPOKE TO / HANG UP", "MARK COLD", "cold")} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#991B1B" }}>Hang Up</button>
                <button onClick={() => setCallStep(4.5)} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#059669" }}>Appointment Set</button>
                <button onClick={() => completeCall("DO NOT CALL", "MARK COLD", "cold")} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#6B7280" }}>Do Not Call</button>
                <button onClick={() => completeCall("WRONG/INCORRECT #", "LOOKUP INFO", "Look-up Info")} style={{ ...btnPrimary(true), width: "100%", justifyContent: "center", backgroundColor: "#F59E0B" }}>Wrong #</button>
                <button onClick={() => setCallStep(2)} style={{ ...pill(false, "#6B7280"), width: "100%", justifyContent: "center" }}>Back</button>
              </div>
            )}

            {/* Step 4.5: DM appointment details */}
            {callStep === 4.5 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Appointment details</div>
                <input style={inp} placeholder="Date, time, notes..." value={callDetails} onChange={e => setCallDetails(e.target.value)} onFocus={focH} onBlur={blurH} />
                <input style={{ ...inp, fontSize: 13 }} placeholder="Additional notes (optional)" value={callCustomNote} onChange={e => setCallCustomNote(e.target.value)} onFocus={focH} onBlur={blurH} />
                <button onClick={() => completeCall(`SPOKE TO / DM / APPOINTMENT SET / ${callDetails.trim().toUpperCase() || "TBD"}`, "COMPLETED", "completed")} disabled={!callDetails.trim()} style={{ ...btnPrimary(!!callDetails.trim()), width: "100%", justifyContent: "center" }}>Confirm Appointment</button>
                <button onClick={() => setCallStep(4)} style={{ ...pill(false, "#6B7280"), width: "100%", justifyContent: "center" }}>Back</button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "14px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: FH, fontSize: 22, fontWeight: 600, color: P }}>Athos</span>
            <span style={{ width: 1, height: 20, backgroundColor: "rgba(0,0,0,0.1)" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6B7280" }}>Lead Queue</span>
          </div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(36,92,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: P, fontSize: 13, fontWeight: 700, fontFamily: FH }}>{(user.fullName || user.firstName || "U")[0]}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: PD }}>{user.fullName || user.firstName || "Rep"}</span>
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

          {/* ── Left Column ── */}
          <div>
            {/* Nav + filters */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button className="lq-n" onClick={goPrev} disabled={queueIdx <= 0} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: queueIdx <= 0 ? "not-allowed" : "pointer", opacity: queueIdx <= 0 ? 0.35 : 1, transition: "all .2s" }}>{I.chevL}</button>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }}>{queueIdx >= 0 ? queueIdx + 1 : "—"} <span style={{ opacity: 0.5 }}>of</span> {total}</span>
                <button className="lq-n" onClick={goNext} disabled={queueIdx >= total - 1} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: queueIdx >= total - 1 ? "not-allowed" : "pointer", opacity: queueIdx >= total - 1 ? 0.35 : 1, transition: "all .2s" }}>{I.chevR}</button>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); lastHydratedId.current = null; setActiveLeadId(null); }} style={{ ...filterSelect, border: `1px solid ${statusFilter !== "all" ? P : "rgba(0,0,0,0.08)"}`, backgroundColor: statusFilter !== "all" ? "rgba(36,92,58,0.04)" : "#fff", color: statusFilter !== "all" ? P : "#6B7280" }}>
                  <option value="all">All statuses</option>
                  {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select value={queueMode} onChange={e => { const newMode = e.target.value; setQueueMode(newMode); setRrCount(0); setTagFilter(prev => { const valid = new Set(); prev.forEach(id => { const opt = TAG_OPTIONS.find(t => t.id === id); if (opt?.modes.includes(newMode)) valid.add(id); }); return valid; }); setTagExclude(prev => { const valid = new Set(); prev.forEach(id => { const opt = TAG_OPTIONS.find(t => t.id === id); if (opt?.modes.includes(newMode)) valid.add(id); }); return valid; }); lastHydratedId.current = null; setActiveLeadId(null); }} style={{ ...filterSelect, border: `1px solid ${queueMode !== "all" ? TEAL : "rgba(0,0,0,0.08)"}`, backgroundColor: queueMode !== "all" ? "rgba(22,98,95,0.04)" : "#fff", color: queueMode !== "all" ? TEAL : "#6B7280" }}>
                  {QUEUE_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
            </div>

            {/* Tag filter */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
              {TAG_OPTIONS.filter(tag => tag.modes.includes(queueMode)).map(tag => {
                const included = tagFilter.has(tag.id);
                const excluded = tagExclude.has(tag.id);
                return (<button key={tag.id} onClick={() => {
                  const nf = new Set(tagFilter); const ne = new Set(tagExclude);
                  if (included) { nf.delete(tag.id); ne.add(tag.id); }
                  else if (excluded) { ne.delete(tag.id); }
                  else { nf.add(tag.id); }
                  setTagFilter(nf); setTagExclude(ne); lastHydratedId.current = null; setActiveLeadId(null);
                }} style={{ padding: "3px 10px", borderRadius: 9999, border: `2px solid ${excluded ? "#991B1B" : included ? tag.c : "rgba(0,0,0,0.06)"}`, backgroundColor: excluded ? "rgba(153,27,27,0.08)" : included ? `${tag.c}18` : "transparent", color: excluded ? "#991B1B" : included ? tag.c : "#9CA3AF", fontSize: 11, fontWeight: 600, fontFamily: FB, cursor: "pointer", transition: "all .15s", textDecoration: excluded ? "line-through" : "none" }}>{tag.label}</button>);
              })}
              {(tagFilter.size > 0 || tagExclude.size > 0) && <button onClick={() => { setTagFilter(new Set()); setTagExclude(new Set()); lastHydratedId.current = null; setActiveLeadId(null); }} style={{ padding: "3px 10px", borderRadius: 9999, border: "none", backgroundColor: "transparent", color: "#9CA3AF", fontSize: 11, fontWeight: 500, fontFamily: FB, cursor: "pointer", textDecoration: "underline" }}>Clear</button>}
              <select value={contactFilter} onChange={e => { setContactFilter(e.target.value); lastHydratedId.current = null; setActiveLeadId(null); }} style={{ ...filterSelect, fontSize: 11, padding: "3px 8px", borderRadius: 9999, border: `1px solid ${contactFilter !== "all" ? TEAL : "rgba(0,0,0,0.08)"}`, backgroundColor: contactFilter !== "all" ? "rgba(22,98,95,0.04)" : "transparent", color: contactFilter !== "all" ? TEAL : "#9CA3AF", fontWeight: 600 }}>
                <option value="all">Last Contact</option>
                <option value="15m">Within 15 min</option>
                <option value="1h">Within 1 hour</option>
                <option value="12h">Within 12 hours</option>
                <option value="24h">Within 24 hours</option>
                <option value="3d">Within 3 days</option>
                <option value="7d">Within 7 days</option>
                <option value="not-24h">Not in 24 hours</option>
                <option value="not-3d">Not in 3 days</option>
                <option value="not-7d">Not in 7 days</option>
                <option value="not-10d">Not in 10+ days</option>
                <option value="never">No contact</option>
              </select>
            </div>

            {/* Lead card */}
            {!lead ? (
              <div style={{ backgroundColor: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.06)", padding: "60px 24px", textAlign: "center" }}>
                <p style={{ color: "#6B7280", fontSize: 15, margin: 0 }}>0 records for current filters</p>
              </div>
            ) : (
            <div style={{ backgroundColor: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: claimed ? "rgba(36,92,58,0.12)" : "rgba(36,92,58,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: P, fontSize: 20, fontWeight: 700, fontFamily: FH, border: claimed ? `2px solid ${P}` : "2px solid transparent" }}>{(editName || handle || "?")[0]}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h2 style={{ fontFamily: FH, fontSize: 24, fontWeight: 600, color: PD, margin: 0, lineHeight: 1.2 }}>{editName || (handle ? `@${handle}` : "Unknown")}</h2>
                      <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${editName} ${(editFocus || "").split(/\s+/)[0] || ""} location`)}`, "_blank")} title="Search location" style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", transition: "all .2s", flexShrink: 0 }}>{I.pin}</button>
                      <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(leadIsClinic ? `Who owns ${editClinicName}?`.trim() : `${editName} ${(editFocus || "").split(/\s+/)[0] || ""}`)}`, "_blank")} title="Search person" style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", transition: "all .2s", flexShrink: 0 }}>{I.search}</button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                      {handle && <a href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 500, color: P, textDecoration: "none" }}>@{handle} {I.ext}</a>}
                      <span style={{ fontSize: 11, fontWeight: 600, color: claimed ? "#059669" : "#9CA3AF", padding: "2px 8px", borderRadius: 9999, backgroundColor: claimed ? "rgba(5,150,105,0.08)" : "rgba(0,0,0,0.03)", border: `1px solid ${claimed ? "rgba(5,150,105,0.2)" : "rgba(0,0,0,0.06)"}` }}>Assigned: {claimed ? (Array.isArray(f.assigned_rep) && f.assigned_rep[0]?.label || user?.fullName || "You") : "Unassigned"}</span>
                      {/* Type dropdown */}
                      <div style={{ position: "relative" }}>
                        <button onClick={() => setShowTypeMenu(!showTypeMenu)} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, border: `1px solid ${leadIsClinic ? "rgba(37,99,235,0.2)" : leadIsMicro ? "rgba(217,119,6,0.2)" : leadIsConsumer ? "rgba(22,98,95,0.2)" : "rgba(36,92,58,0.2)"}`, color: leadIsClinic ? "#2563EB" : leadIsMicro ? "#D97706" : leadIsConsumer ? TEAL : P, backgroundColor: leadIsClinic ? "rgba(37,99,235,0.08)" : leadIsMicro ? "rgba(217,119,6,0.08)" : leadIsConsumer ? "rgba(22,98,95,0.08)" : "rgba(36,92,58,0.08)", cursor: "pointer", fontFamily: FB }}>{leadIsClinic ? "Clinic" : leadIsMicro ? "Micro-Influencer" : leadIsConsumer ? "Consumer" : "Influencer"}</button>
                        {showTypeMenu && (<>
                          <div onClick={() => setShowTypeMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
                          <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, backgroundColor: "#fff", borderRadius: 10, border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 20, overflow: "hidden", minWidth: 140 }}>
                            {[{ id: "Influencer", c: P }, { id: "Clinic", c: "#2563EB" }, { id: "Consumer", c: TEAL }, { id: "Micro-Influencer", c: "#D97706" }].map(opt => {
                              const currentLabel = leadIsClinic ? "Clinic" : leadIsMicro ? "Micro-Influencer" : leadIsConsumer ? "Consumer" : "Influencer";
                              const isCur = opt.id === currentLabel;
                              return (<button key={opt.id} onClick={async () => {
                                setShowTypeMenu(false);
                                if (isCur) return;
                                const tid = toast.loading(`Changing to ${opt.id}...`);
                                try {
                                  await updateRecord.mutateAsync({ recordId: lead.id, fields: { lead_type: opt.id } });
                                  setConfirmedLeadType(opt.id.toLowerCase());
                                  setDmMsgIdx(0); setCopied(false);
                                  toast.success(`Lead type: ${opt.id}`, { id: tid });
                                } catch (err) { toast.error("Save failed", { id: tid, description: err.message }); }
                              }} style={{ display: "block", width: "100%", padding: "8px 14px", border: "none", backgroundColor: isCur ? `${opt.c}18` : "transparent", color: isCur ? opt.c : "#6B7280", fontSize: 12, fontWeight: 600, fontFamily: FB, cursor: "pointer", textAlign: "left", borderLeft: `3px solid ${isCur ? opt.c : "transparent"}` }}>{opt.id}</button>);
                            })}
                          </div>
                        </>)}
                      </div>
                      {f.skool_community_link && <a href={f.skool_community_link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "#6B7280", padding: "2px 8px", borderRadius: 9999, backgroundColor: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)", textDecoration: "none" }}>Skool {I.ext}</a>}
                      {getTags(lead).map(tag => { const to = TAG_OPTIONS.find(t => t.id === tag.toLowerCase()); return <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 9999, color: to?.c || "#6B7280", backgroundColor: `${to?.c || "#6B7280"}18`, border: `1px solid ${to?.c || "#6B7280"}40` }}>{to?.label || tag}</span>; })}
                    </div>
                  </div>
                </div>
                <div style={{ ...pill(true, so.c), cursor: "default" }}><span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: so.c }} />{so.label}</div>
              </div>

              {/* Metrics */}
              <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                {leadIsClinic ? (
                  <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    {[{ l: "Clinic Name", v: editClinicName, set: setEditClinicName, ph: "Enter clinic name" }, { l: "Address", v: editAddress, set: setEditAddress, ph: "Enter address" }, { l: "Gatekeeper", v: editGateKeeper, set: setEditGateKeeper, ph: "Enter gatekeeper name" }].map((m, i) => (<div key={i} style={{ flex: 1, padding: "10px 24px", borderRight: i < 2 ? "1px solid rgba(0,0,0,0.05)" : "none" }}><div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3 }}>{m.l}</div><input value={m.v} onChange={e => m.set(e.target.value)} placeholder={m.ph} style={{ width: "100%", fontFamily: FB, fontSize: 15, fontWeight: 600, padding: "2px 0", border: "none", borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "transparent", color: PD, outline: "none", boxSizing: "border-box" }} onFocus={focH} onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.06)"; }} /></div>))}
                  </div>
                ) : (
                  <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    {[{ l: "Followers", v: fmtF(editFollowers) }, { l: "Focus", v: editFocus || "—" }].map((m, i) => (<div key={i} style={{ flex: 1, padding: "14px 24px", borderRight: i === 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}><div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3 }}>{m.l}</div><div style={{ fontSize: 16, fontWeight: 600, color: PD }}>{m.v}</div></div>))}
                  </div>
                )}
              </div>

              {/* Tasks */}
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}><h3 style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: 0 }}>Tasks</h3><span style={{ fontSize: 12, fontWeight: 600, color: allDone ? "#059669" : "#9CA3AF" }}>{[...done].filter(id => visibleTasks.some(t => t.id === id)).length}/{visibleTasks.length}</span></div>
                {isNC && !leadIsClinic && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    <button onClick={() => setNcDm(!ncDm)} style={{ ...pill(ncDm, "#0EA5E9"), padding: "5px 12px", fontSize: 12 }}><span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ncDm ? "#0EA5E9" : "rgba(0,0,0,0.12)" }} />DM</button>
                    <button onClick={() => setNcCall(!ncCall)} style={{ ...pill(ncCall, "#0EA5E9"), padding: "5px 12px", fontSize: 12 }}><span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ncCall ? "#0EA5E9" : "rgba(0,0,0,0.12)" }} />Call</button>
                  </div>
                )}
                <div style={{ width: "100%", height: 5, borderRadius: 9999, backgroundColor: "rgba(0,0,0,0.04)", marginBottom: 14, overflow: "hidden" }}><div style={{ width: `${Math.min(progress * 100, 100)}%`, height: "100%", borderRadius: 9999, backgroundColor: allDone ? "#059669" : P, transition: "width .35s ease" }} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{visibleTasks.map(renderTask)}</div>
              </div>

              {/* Status */}
              <div style={{ padding: "16px 24px 20px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 10px" }}>Mark as</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{visibleStatuses.map(s => (<button key={s.id} className="lq-sb" onClick={() => { setLeadStatus(s.id); saveLead({ status: s.id }); }} style={pill(leadStatus === s.id, s.c)}><span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: leadStatus === s.id ? s.c : "rgba(0,0,0,0.12)" }} />{s.label}</button>))}</div>
              </div>

              {/* Submit */}
              <div style={{ padding: "0 24px 24px" }}>
                <button onClick={handleSubmit} disabled={!allDone || submitting} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 12, border: "none", backgroundColor: allDone && !submitting ? P : "rgba(0,0,0,0.04)", color: allDone && !submitting ? "#fff" : "#9CA3AF", fontSize: 15, fontWeight: 600, fontFamily: FB, cursor: allDone && !submitting ? "pointer" : "not-allowed", transition: "all .3s" }}>
                  {submitting ? "Saving..." : allDone ? "Submit & Next Lead" : "Complete all tasks to submit"} {!submitting && I.chevR}
                </button>
              </div>
            </div>
            )}
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!lead ? (
              <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", padding: "24px 16px", textAlign: "center" }}>
                <p style={{ color: "#9CA3AF", fontSize: 13, margin: 0 }}>Select a tag with records to view leads</p>
              </div>
            ) : (<>
            {/* Admin */}
            {isAdmin && (
            <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(22,98,95,0.15)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", overflow: "hidden" }}>
              <button onClick={() => setShowAdmin(!showAdmin)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", border: "none", backgroundColor: "transparent", cursor: "pointer", fontFamily: FB }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: TEAL }}>{I.shield} Admin Edits</span>
                <span style={{ transform: showAdmin ? "rotate(180deg)" : "none", transition: "transform .2s", color: "#9CA3AF" }}>{I.chevD}</span>
              </button>
              {showAdmin && (
                <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setAdminReviewed(!adminReviewed)}>
                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, border: `2px solid ${adminReviewed ? P : "rgba(0,0,0,0.15)"}`, backgroundColor: adminReviewed ? P : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>{adminReviewed && I.chk()}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: PD }}>Admin Reviewed</span>
                  </label>
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Admin notes..." style={{ ...inp, minHeight: 70, fontSize: 13, resize: "vertical", lineHeight: 1.5 }} onFocus={focH} onBlur={blurH} />
                </div>
              )}
            </div>
            )}

            {/* Notes */}
            <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>{I.notepad} Notes</h3>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setShowNoteTip(!showNoteTip)} style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)", backgroundColor: showNoteTip ? "rgba(36,92,58,0.08)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: "#9CA3AF" }}>{I.tip}</button>
                    {showNoteTip && (<div style={{ position: "absolute", top: 24, left: -80, width: 220, padding: 12, borderRadius: 10, backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 20, fontSize: 12, lineHeight: 1.5, color: "#4B5563" }}><div style={{ fontWeight: 600, color: PD, marginBottom: 4 }}>Note format</div><div style={{ fontFamily: "monospace", fontSize: 11, color: P, padding: "6px 8px", borderRadius: 6, backgroundColor: "rgba(36,92,58,0.04)", marginBottom: 6 }}>MM-DD-YY // ACTION // DETAILS // NEXT STEP</div><div>Use the Add Note button to auto-format. Newest notes appear on top.</div></div>)}
                  </div>
                </div>
                <button onClick={() => { setShowNoteModal(true); setShowNoteTip(false); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 9999, border: `1px solid ${P}`, backgroundColor: "transparent", color: P, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FB }}>{I.plus} Add note</button>
              </div>
              {noteLines.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
                  {noteLines.map((line, i) => { const parts = line.split("//").map(p => p.trim()); return (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 8, backgroundColor: i === 0 ? "rgba(36,92,58,0.04)" : "rgba(0,0,0,0.02)", borderLeft: i === 0 ? `3px solid ${P}` : "3px solid transparent" }}>
                      <div style={{ fontSize: 12, fontFamily: "monospace", color: i === 0 ? PD : "#6B7280", lineHeight: 1.5, wordBreak: "break-word" }}>
                        {parts[0] && <span style={{ fontWeight: 600 }}>{parts[0]}</span>}
                        {parts[1] && <span style={{ color: P }}> // {parts[1]}</span>}
                        {parts[2] && <span> // {parts[2]}</span>}
                        {parts[3] && <span style={{ color: TEAL }}> // {parts[3]}</span>}
                        {parts.slice(4).map((p, j) => <span key={j} style={{ color: "#6B7280", fontStyle: "italic" }}> // {p}</span>)}
                      </div>
                    </div>
                  ); })}
                </div>
              ) : (<div style={{ padding: "16px 0", textAlign: "center" }}><p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>No notes yet</p></div>)}
            </div>

            {/* Contact Info */}
            <div style={{ backgroundColor: "#fff", borderRadius: 14, border: contactDirty ? `1px solid ${P}` : "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                <button onClick={() => setShowContact(!showContact)} style={{ display: "flex", alignItems: "center", gap: 8, border: "none", backgroundColor: "transparent", cursor: "pointer", fontFamily: FB, padding: 0 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: 0 }}>Contact Info</h3>
                  <span style={{ transform: showContact ? "rotate(180deg)" : "none", transition: "transform .2s", color: "#9CA3AF" }}>{I.chevD}</span>
                </button>
                {contactDirty && <button onClick={saveContactInfo} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 9999, border: "none", backgroundColor: P, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FB }}>{I.chk("#fff", 12)} Save</button>}
              </div>
              <div style={{ padding: "0 16px 16px" }}>
                {showContact && [{ l: "Name", v: editName, set: setEditName }, { l: "Handle", v: editHandle, set: setEditHandle, prefix: "@" }, { l: "Followers", v: editFollowers, set: setEditFollowers }, { l: "Focus", v: editFocus, set: setEditFocus }].map((r, i) => (
                  <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{r.l}</div>
                    <div style={{ position: "relative" }}>
                      {r.prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#9CA3AF", pointerEvents: "none" }}>{r.prefix}</span>}
                      <input value={r.v} onChange={e => r.set(e.target.value)} placeholder={`Enter ${r.l.toLowerCase()}`} style={{ width: "100%", fontFamily: FB, fontSize: 13, fontWeight: 500, padding: r.prefix ? "6px 10px 6px 24px" : "6px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)", backgroundColor: r.v ? "#fff" : "rgba(0,0,0,0.02)", color: PD, outline: "none", boxSizing: "border-box" }} onFocus={focH} />
                    </div>
                  </div>
                ))}
                {[{ l: "Phone 1", v: phone1, set: setPhone1 }, { l: "Phone 2", v: phone2, set: setPhone2 }, { l: "Email", v: emailVal, set: setEmailVal }].map((r, i) => (
                  <div key={`c${i}`} style={{ padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{r.l}</div>
                    <input value={r.v} onChange={e => r.set(e.target.value)} placeholder={`Enter ${r.l.toLowerCase()}`} style={{ width: "100%", fontFamily: FB, fontSize: 13, fontWeight: 500, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)", backgroundColor: r.v ? "#fff" : "rgba(0,0,0,0.02)", color: PD, outline: "none", boxSizing: "border-box" }} onFocus={focH} />
                  </div>
                ))}
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: PD }}>Add to Drip Campaign</span>
                  <button onClick={() => { const next = !dripActive; setDripActive(next); saveLead({ email_drip_active: next }); }} style={{ width: 44, height: 24, borderRadius: 12, border: "none", backgroundColor: dripActive ? P : "rgba(0,0,0,0.12)", position: "relative", cursor: "pointer", transition: "background-color .2s", padding: 0, flexShrink: 0 }}>
                    <span style={{ position: "absolute", top: 2, left: dripActive ? 22 : 2, width: 20, height: 20, borderRadius: "50%", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left .2s" }} />
                  </button>
                </div>
                {dripActive && <div style={{ marginTop: 6, padding: "4px 10px", borderRadius: 9999, backgroundColor: "rgba(36,92,58,0.08)", fontSize: 11, fontWeight: 500, color: P, display: "inline-flex" }}>Drip active</div>}
                {f.skool_community_link && (
                  <div style={{ marginTop: 10, padding: "6px 0", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>Skool</div>
                    <a href={f.skool_community_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 500, color: P, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>Community Link {I.ext}</a>
                  </div>
                )}
                {getTags(lead).length > 0 && (
                  <div style={{ marginTop: 8, padding: "6px 0", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>Tags</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{getTags(lead).map(tag => { const to = TAG_OPTIONS.find(t => t.id === tag.toLowerCase()); return <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 9999, color: to?.c || "#6B7280", backgroundColor: `${to?.c || "#6B7280"}18`, border: `1px solid ${to?.c || "#6B7280"}40` }}>{to?.label || tag}</span>; })}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Queue */}
            <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", padding: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 10px" }}>Queue</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 240, overflowY: "auto" }}>
                {filteredQueue.slice(Math.max(0, (queueIdx >= 0 ? queueIdx : 0) - 2), (queueIdx >= 0 ? queueIdx : 0) + 8).map((it) => {
                  const cur = it.id === activeLeadId;
                  const sSt = stObj(it.fields.status || "New Lead");
                  const isCons = isConsumer(it);
                  const isMi = isMicro(it);
                  const isCl = isClinic(it);
                  return (
                    <div key={it.id} onClick={() => selectLead(it.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, backgroundColor: cur ? "rgba(36,92,58,0.05)" : "transparent", borderLeft: `3px solid ${cur ? P : "transparent"}`, cursor: "pointer", transition: "all .15s" }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: isCl ? "rgba(37,99,235,0.1)" : isMi ? "rgba(217,119,6,0.1)" : isCons ? "rgba(22,98,95,0.1)" : "rgba(36,92,58,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: isCl ? "#2563EB" : isMi ? "#D97706" : isCons ? TEAL : P, flexShrink: 0 }}>{isCl ? "Cl" : isMi ? "M" : isCons ? "C" : "I"}</span>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: sSt.c, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: cur ? 600 : 400, color: cur ? PD : "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{it.fields.name || (it.fields.handle ? `@${it.fields.handle.replace("@","")}` : "—")}</span>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{fmtF(it.fields.followers)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Common Objections */}
            {!leadIsConsumer && (
            <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", padding: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>{I.msg} Common Objections</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(leadIsClinic ? CLINIC_OBJECTIONS : OBJECTIONS).map(obj => (
                  <AccordionRow key={obj.id} item={obj} isOpen={activeObjId === obj.id} toggle={() => setActiveObjId(activeObjId === obj.id ? null : obj.id)}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: TEAL, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>Suggested response</div>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: "#374151", margin: "0 0 10px" }}>{obj.response}</p>
                    <div style={{ padding: "8px 10px", borderRadius: 8, backgroundColor: "rgba(22,98,95,0.06)", border: "1px solid rgba(22,98,95,0.12)" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: TEAL, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>{I.bulb} Tip</div>
                      <p style={{ fontSize: 12, lineHeight: 1.5, color: "#6B7280", margin: 0 }}>{obj.tip}</p>
                    </div>
                  </AccordionRow>
                ))}
              </div>
            </div>
            )}

            {/* Sales Scripts */}
            {!leadIsConsumer && (
            <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", padding: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>{I.zap} Sales Scripts</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(leadIsClinic ? CLINIC_SCRIPTS : SCRIPTS).map(script => (
                  <AccordionRow key={script.id} item={script} isOpen={activeScriptId === script.id} toggle={() => setActiveScriptId(activeScriptId === script.id ? null : script.id)}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {script.lines.map((line, li) => {
                        if (line.role === "note") return (<div key={li} style={{ padding: "8px 10px", borderRadius: 8, backgroundColor: "rgba(22,98,95,0.06)", border: "1px solid rgba(22,98,95,0.12)" }}><div style={{ fontSize: 11, fontWeight: 600, color: TEAL, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>{I.bulb} Note</div><p style={{ fontSize: 12, lineHeight: 1.5, color: "#6B7280", margin: 0 }}>{line.text}</p></div>);
                        if (line.role === "them") return (<div key={li} style={{ padding: "8px 10px", borderRadius: 8, backgroundColor: "rgba(0,0,0,0.03)", borderLeft: "3px solid rgba(0,0,0,0.1)" }}><p style={{ fontSize: 13, lineHeight: 1.5, color: "#9CA3AF", margin: 0, fontStyle: "italic" }}>{line.text}</p></div>);
                        return (<div key={li} style={{ padding: "8px 10px", borderRadius: 8, backgroundColor: "rgba(36,92,58,0.04)", borderLeft: `3px solid ${P}` }}><p style={{ fontSize: 13, lineHeight: 1.6, color: "#374151", margin: 0 }}>{line.text.replace("[Name]", firstName).replace("[focus]", focusLabel)}</p></div>);
                      })}
                    </div>
                  </AccordionRow>
                ))}
              </div>
            </div>
            )}

            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}