Part 1 — Lead Detail & Pipeline Views
Features not yet built that revolve around a single lead's workspace and the visual pipeline:

Lead Detail Page (/dashboard/leads/[id]) — missing tabs:

Notes tab (create/pin/delete markdown notes)
Emails tab (conversation thread view, compose inline)
Meetings tab (list + schedule meeting form)
Attachments tab (upload PDF, images, contracts; list + delete)
Edit lead form inline (currently only delete is wired)
Pipeline / Kanban page (/dashboard/pipeline):

Kanban board with columns per status (New → Won/Lost)
Drag-and-drop cards via @dnd-kit
Quick-move status from card
Pipeline sidebar: per-column count, revenue totals
Table view toggle (reuse LeadsTable)
Sidebar nav link added for Pipeline
Missing UI components:

NotesList / NoteCard component
MeetingsList component
AttachmentsList component
LeadEditDialog (full form, prefilled)
Part 2 — Email System, Notifications & Calendar Enhancements
Emails page (/dashboard/emails) — incomplete:

Lead picker (autocomplete search, not raw ID input) in compose
Full Gmail-style conversation thread grouped by threadId
Reply-in-thread support
Draft save before sending
Email detail shows attached files
Calendar page — incomplete:

Meeting events pulled from /api/meetings (currently only follow-ups)
Click day to create follow-up or meeting directly
Agenda view (list of upcoming events sorted by date)
Week view layout
Notifications system:

NotificationBell component in header (unread count badge)
Dropdown panel listing recent notifications
Mark as read (individual + all)
Wired to /api/notifications
Missing UI components:

NotificationBell in header
ThreadView email conversation component
AgendaView calendar variant
Part 3 — Chrome Extension, Analytics Depth, Settings & Auth Pages
Chrome Extension (Manifest V3):

extension/ folder: manifest.json, popup.html, popup.tsx, content.ts, background.ts
Auto-detect current site (LinkedIn, Twitter, GitHub, Instagram)
Extract: name, headline, company, bio, profile URL, image
Popup UI: profile card + Save / Open Dashboard / Cancel buttons
Duplicate detection before saving (call /api/leads with check)
Pair with CRM via API key in extension settings
Analytics page — incomplete:

Revenue graph over time (monthly bar chart)
Follow-up trend chart
Email performance (open rate, click rate, reply rate)
Top performing platforms table
Date range picker (7d / 30d / 90d / This Month / This Year)
/api/analytics already exists — wire remaining charts
Settings page — incomplete:

Email signature editor (save to /api/settings)
API key display/regenerate (for extension pairing)
Import CSV flow (parse + bulk-create leads)
Export data (call /api/leads/bulk for CSV download)
Timezone selector
Auth pages — incomplete:

Forgot password page (/(auth)/forgot-password/page.tsx) — missing entirely
Login / Signup pages: check if they have proper error states, loading skeletons, and redirect after auth
Missing stores/hooks:

useNotifications hook (poll or fetch on mount)
useLeadSearch hook (debounced search for lead picker)
notifications.store.ts
