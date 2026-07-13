"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Mail, Phone, Globe,
  MapPin, Building2, Calendar, Clock, Edit, Trash2, Tag,
  Link as LinkIcon,
} from "lucide-react";

// Brand icons were removed from lucide-react v1 — use inline SVGs instead
const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
  </svg>
);
const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);
import { format } from "date-fns";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { StatusBadge, PriorityBadge, PlatformBadge } from "@/components/leads/lead-badge";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { NotesTab } from "@/components/leads/notes-tab";
import { MeetingsTab } from "@/components/leads/meetings-tab";
import { EmailsTab } from "@/components/leads/emails-tab";
import { AttachmentsTab } from "@/components/leads/attachments-tab";
import { LeadEditDialog } from "@/components/leads/lead-edit-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatCurrency, cn } from "@/lib/utils";
import type { ILead } from "@outreach/shared";

// ─── Info Row ────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon, label, value, href,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="text-xs text-muted-foreground block">{label}</span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm truncate block">{value}</span>
        )}
      </div>
    </div>
  );
}

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { key: "activity", label: "Activity" },
  { key: "notes", label: "Notes" },
  { key: "emails", label: "Emails" },
  { key: "meetings", label: "Meetings" },
  { key: "attachments", label: "Attachments" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [lead, setLead] = useState<ILead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("activity");
  const [showEdit, setShowEdit] = useState(false);

  const loadLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const json = await res.json();
      if (json.success) setLead(json.data as ILead);
      else router.push("/dashboard/leads");
    } catch {
      router.push("/dashboard/leads");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => { void loadLead(); }, [loadLead]);

  async function handleDelete() {
    if (!confirm(`Delete ${lead?.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Lead deleted");
        router.push("/dashboard/leads");
      }
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  async function handleArchive() {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Lead archived");
        router.push("/dashboard/leads");
      } else {
        toast.error(json.error ?? "Failed to archive");
      }
    } catch {
      toast.error("Failed to archive lead");
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <Header title="Lead" />
        <div className="flex-1 p-4 sm:p-6 max-w-[1200px] animate-pulse">
          <div className="h-7 bg-muted/40 rounded w-40 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-4">
              <div className="h-36 bg-muted/30 rounded-xl" />
              <div className="h-32 bg-muted/30 rounded-xl" />
              <div className="h-24 bg-muted/30 rounded-xl" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-12 bg-muted/30 rounded-xl" />
              <div className="h-64 bg-muted/30 rounded-xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!lead) return null;

  return (
    <>
      <Header
        title={lead.name}
        description={lead.company}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowEdit(true)}
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-4 sm:p-6">
        {/* Back */}
        <div className="mb-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/leads")}
            className="gap-1.5 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            All Leads
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-[1200px]">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Profile card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-14 h-14 shrink-0">
                  {lead.profileImage && (
                    <AvatarImage src={lead.profileImage} alt={lead.name} />
                  )}
                  <AvatarFallback className="text-base bg-primary/10 text-primary font-semibold">
                    {getInitials(lead.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold truncate">{lead.name}</h2>
                  {lead.designation && (
                    <p className="text-sm text-muted-foreground truncate">{lead.designation}</p>
                  )}
                  {lead.company && (
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      {lead.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <PlatformBadge platform={lead.platform} />
                <StatusBadge status={lead.status} />
                <PriorityBadge priority={lead.priority} />
              </div>

              {lead.tags && lead.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
                  {lead.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-md"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Contact
              </h3>
              <InfoRow icon={Mail} label="Email" value={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : undefined} />
              <InfoRow icon={MapPin} label="Location" value={lead.location} />
              <InfoRow icon={Globe} label="Website" value={lead.website} href={lead.website} />
            </div>

            {/* Social */}
            {(lead.linkedin || lead.twitter || lead.github || lead.instagram || lead.portfolio) && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Social
                </h3>
                <InfoRow icon={Linkedin} label="LinkedIn" value={lead.linkedin} href={lead.linkedin} />
                <InfoRow icon={Twitter} label="Twitter / X" value={lead.twitter} href={lead.twitter} />
                <InfoRow icon={Github} label="GitHub" value={lead.github} href={lead.github} />
                <InfoRow icon={Instagram} label="Instagram" value={lead.instagram} href={lead.instagram} />
                <InfoRow icon={LinkIcon} label="Portfolio" value={lead.portfolio} href={lead.portfolio} />
              </div>
            )}

            {/* Financials */}
            {(lead.budget || lead.expectedRevenue || lead.projectType) && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Financials
                </h3>
                {lead.budget != null && (
                  <div className="flex justify-between py-1.5 text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium tabular-nums">{formatCurrency(lead.budget)}</span>
                  </div>
                )}
                {lead.expectedRevenue != null && (
                  <div className="flex justify-between py-1.5 text-sm">
                    <span className="text-muted-foreground">Expected</span>
                    <span className="font-medium tabular-nums text-green-400">
                      {formatCurrency(lead.expectedRevenue)}
                    </span>
                  </div>
                )}
                {lead.projectType && (
                  <div className="flex justify-between py-1.5 text-sm">
                    <span className="text-muted-foreground">Project type</span>
                    <span className="capitalize">{lead.projectType.replace("_", " ")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Timeline
              </h3>
              <InfoRow
                icon={Calendar}
                label="Created"
                value={format(new Date(lead.createdAt), "MMM d, yyyy 'at' h:mm a")}
              />
              {lead.lastContact && (
                <InfoRow
                  icon={Clock}
                  label="Last Contact"
                  value={format(new Date(lead.lastContact), "MMM d, yyyy")}
                />
              )}
              {lead.nextFollowUp && (
                <InfoRow
                  icon={Calendar}
                  label="Next Follow-up"
                  value={format(new Date(lead.nextFollowUp), "MMM d, yyyy")}
                />
              )}
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 justify-start"
                onClick={() => setShowEdit(true)}
              >
                <Edit className="w-4 h-4" /> Edit Lead
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 justify-start text-muted-foreground"
                onClick={handleArchive}
              >
                Archive Lead
              </Button>
            </div>
          </motion.div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Bio */}
            {lead.bio && (
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{lead.bio}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-border overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "shrink-0 px-5 py-3 text-sm font-medium transition-colors relative",
                      activeTab === tab.key
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="lead-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="p-5"
                >
                  {activeTab === "activity" && (
                    <ActivityFeed leadId={lead.id} limit={25} />
                  )}
                  {activeTab === "notes" && (
                    <NotesTab leadId={lead.id} />
                  )}
                  {activeTab === "emails" && (
                    <EmailsTab leadId={lead.id} />
                  )}
                  {activeTab === "meetings" && (
                    <MeetingsTab leadId={lead.id} />
                  )}
                  {activeTab === "attachments" && (
                    <AttachmentsTab leadId={lead.id} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit dialog */}
      {lead && (
        <LeadEditDialog
          lead={lead}
          open={showEdit}
          onOpenChange={setShowEdit}
          onSuccess={(updated) => setLead(updated)}
        />
      )}
    </>
  );
}
