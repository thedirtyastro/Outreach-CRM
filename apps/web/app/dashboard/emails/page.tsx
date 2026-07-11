"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Mail, Send, Clock, Search, Plus, Loader2,
  CheckCircle2, XCircle, AlertCircle, Eye, MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComposeEmailDialog } from "@/components/emails/compose-email-dialog";
import { ThreadView } from "@/components/emails/thread-view";
import { cn } from "@/lib/utils";
import type { IEmail } from "@outreach/shared";

type EmailWithMeta = IEmail & { leadName?: string };

/** Group emails into conversation threads */
function groupIntoThreads(emails: EmailWithMeta[]): Map<string, EmailWithMeta[]> {
  const threads = new Map<string, EmailWithMeta[]>();

  for (const email of emails) {
    // Use threadId if set, otherwise fall back to leadId (groups all emails to the same lead)
    const key = email.threadId ?? email.leadId;
    if (!threads.has(key)) threads.set(key, []);
    threads.get(key)!.push(email);
  }

  // Sort messages within each thread oldest → newest
  for (const [, msgs] of threads) {
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  return threads;
}

/** Get the representative email for a thread (most recent) */
function threadHead(msgs: EmailWithMeta[]): EmailWithMeta {
  return msgs[msgs.length - 1];
}

const STATUS_ICON: Record<string, React.ElementType> = {
  sent: Send,
  draft: Clock,
  failed: XCircle,
};

const STATUS_COLOR: Record<string, string> = {
  sent: "text-green-400",
  draft: "text-yellow-400",
  failed: "text-red-400",
};

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedThreadKey, setSelectedThreadKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/emails?${params}`);
      const json = await res.json() as { emails?: EmailWithMeta[] };
      setEmails(json.emails ?? []);
    } catch {
      toast.error("Failed to load emails");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { void load(); }, [load]);

  // Filter by search
  const filteredEmails = useMemo(() => {
    if (!search) return emails;
    const q = search.toLowerCase();
    return emails.filter((e) =>
      e.subject.toLowerCase().includes(q) ||
      e.to.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q)
    );
  }, [emails, search]);

  // Thread groups from filtered emails
  const threads = useMemo(() => groupIntoThreads(filteredEmails), [filteredEmails]);

  // Sort thread keys by most recent message
  const sortedThreadKeys = useMemo(() =>
    [...threads.keys()].sort((a, b) => {
      const aDate = new Date(threadHead(threads.get(a)!).createdAt).getTime();
      const bDate = new Date(threadHead(threads.get(b)!).createdAt).getTime();
      return bDate - aDate;
    }),
    [threads]
  );

  const selectedThread = selectedThreadKey ? (threads.get(selectedThreadKey) ?? null) : null;

  const sentCount = emails.filter((e) => e.status === "sent").length;
  const openedCount = emails.filter((e) => e.openedAt).length;
  const clickedCount = emails.filter((e) => e.clickedAt).length;

  return (
    <>
      <Header
        title="Emails"
        description={`${sentCount} sent · ${threads.size} thread${threads.size !== 1 ? "s" : ""}`}
        actions={
          <Button size="sm" onClick={() => setShowCompose(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Compose
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-5 max-w-[1400px]">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Sent", value: sentCount, icon: Send, color: "text-blue-400" },
            { label: "Opened", value: openedCount, icon: Eye, color: "text-green-400" },
            { label: "Clicked", value: clickedCount, icon: CheckCircle2, color: "text-purple-400" },
            {
              label: "Open Rate",
              value: sentCount > 0 ? `${Math.round((openedCount / sentCount) * 100)}%` : "0%",
              icon: AlertCircle,
              color: "text-yellow-400",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-semibold tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "sent", "draft", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setSelectedThreadKey(null); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Thread list + detail */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[550px]">
          {/* Thread list */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : sortedThreadKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                <Mail className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No emails found</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowCompose(true)}>
                  Compose an email
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border overflow-auto max-h-[600px]">
                {sortedThreadKeys.map((key) => {
                  const msgs = threads.get(key)!;
                  const head = threadHead(msgs);
                  const StatusIcon = STATUS_ICON[head.status] ?? Mail;
                  const hasUnread = msgs.some((m) => !m.openedAt && m.status === "sent");
                  const isSelected = selectedThreadKey === key;

                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedThreadKey(isSelected ? null : key)}
                      className={cn(
                        "w-full text-left p-3.5 hover:bg-muted/30 transition-colors",
                        isSelected && "bg-muted/30 border-l-2 border-primary"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <StatusIcon className={cn("w-4 h-4 mt-0.5 shrink-0", STATUS_COLOR[head.status])} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className={cn("text-sm truncate", hasUnread ? "font-semibold" : "font-medium")}>
                              {head.to}
                            </p>
                            <p className="text-xs text-muted-foreground shrink-0">
                              {format(new Date(head.createdAt), "MMM d")}
                            </p>
                          </div>
                          <p className="text-xs font-medium truncate mb-0.5">
                            {head.subject.replace(/^(re:\s*)+/i, "")}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{head.body}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {msgs.length > 1 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <MessageSquare className="w-3 h-3" />
                                {msgs.length}
                              </span>
                            )}
                            {head.openedAt && (
                              <span className="text-xs text-green-400 flex items-center gap-0.5">
                                <Eye className="w-3 h-3" /> Opened
                              </span>
                            )}
                            {head.clickedAt && (
                              <span className="text-xs text-purple-400 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Clicked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Thread detail / conversation view */}
          <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden flex flex-col min-h-[550px]">
            {selectedThread ? (
              <ThreadView
                emails={selectedThread}
                onReplySuccess={load}
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
                <Mail className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">Select a conversation to view</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={() => setShowCompose(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Compose new email
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ComposeEmailDialog
        open={showCompose}
        onOpenChange={setShowCompose}
        onSuccess={load}
      />
    </>
  );
}
