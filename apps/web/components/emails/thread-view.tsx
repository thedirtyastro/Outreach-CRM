"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Mail, Send, Clock, XCircle, Eye, CheckCircle2, ChevronDown,
  Reply, Paperclip, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { IEmail } from "@outreach/shared";

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

interface ThreadViewProps {
  /** All emails in this thread (same threadId or same leadId), sorted oldest → newest */
  emails: IEmail[];
  onReplySuccess: () => void;
}

interface ReplyState {
  body: string;
  isSubmitting: boolean;
}

export function ThreadView({ emails, onReplySuccess }: ThreadViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    // Expand the last email by default
    () => new Set(emails.length > 0 ? [emails[emails.length - 1].id] : [])
  );
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState<ReplyState>({ body: "", isSubmitting: false });

  if (emails.length === 0) return null;

  const latest = emails[emails.length - 1];
  const threadSubject = latest.subject.replace(/^(re:\s*)+/i, "");

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleReply() {
    if (!reply.body.trim()) {
      toast.error("Reply body cannot be empty");
      return;
    }

    setReply((r) => ({ ...r, isSubmitting: true }));
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: latest.leadId,
          subject: `Re: ${threadSubject}`,
          body: reply.body,
          threadId: latest.threadId ?? latest.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to send reply");
      }

      toast.success("Reply sent");
      setReply({ body: "", isSubmitting: false });
      setShowReply(false);
      onReplySuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply");
      setReply((r) => ({ ...r, isSubmitting: false }));
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="px-5 py-4 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold">{threadSubject}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {emails.length} message{emails.length !== 1 ? "s" : ""} · To: {latest.to}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/50">
        {emails.map((email, idx) => {
          const isExpanded = expandedIds.has(email.id);
          const isLast = idx === emails.length - 1;
          const StatusIcon = STATUS_ICON[email.status] ?? Mail;

          return (
            <div key={email.id} className={cn("px-5 py-3", isLast && "pb-4")}>
              {/* Message header — always visible */}
              <button
                type="button"
                onClick={() => toggleExpand(email.id)}
                className="w-full flex items-center gap-3 text-left group"
              >
                <div className={cn("shrink-0", STATUS_COLOR[email.status])}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{email.from}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(email.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  {!isExpanded && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {email.body.slice(0, 100)}
                    </p>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {/* Expanded body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pl-7 space-y-3">
                      {/* Tracking badges */}
                      {(email.openedAt || email.clickedAt) && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {email.openedAt && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                              <Eye className="w-3 h-3" />
                              Opened {format(new Date(email.openedAt), "MMM d 'at' h:mm a")}
                            </span>
                          )}
                          {email.clickedAt && (
                            <span className="inline-flex items-center gap-1 text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Clicked {format(new Date(email.clickedAt), "MMM d 'at' h:mm a")}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Body */}
                      <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
                        {email.body}
                      </pre>

                      {/* Attachments */}
                      {email.attachments && email.attachments.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          {email.attachments.map((url, i) => {
                            const name = url.split("/").pop() ?? `Attachment ${i + 1}`;
                            return (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded"
                              >
                                {name}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Reply composer */}
      <div className="shrink-0 border-t border-border px-5 py-4">
        <AnimatePresence>
          {showReply ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-3"
            >
              <div className="text-xs text-muted-foreground mb-1">
                Reply to <span className="text-foreground">{latest.to}</span>
              </div>
              <Textarea
                rows={4}
                placeholder="Write your reply…"
                value={reply.body}
                onChange={(e) => setReply((r) => ({ ...r, body: e.target.value }))}
                className="resize-none text-sm"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReply(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={reply.isSubmitting || !reply.body.trim()}
                  className="gap-1.5"
                >
                  {reply.isSubmitting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending…</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" />Send Reply</>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReply(true)}
              className="gap-1.5"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </Button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
