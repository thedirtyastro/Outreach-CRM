"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Mail, Send, Eye, MousePointerClick, Clock, Plus,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ComposeEmailDialog } from "@/components/emails/compose-email-dialog";
import { cn } from "@/lib/utils";
import type { IEmail } from "@outreach/shared";

interface EmailsTabProps {
  leadId: string;
}

const STATUS_STYLE: Record<string, string> = {
  sent: "text-green-400",
  draft: "text-yellow-400",
  failed: "text-red-400",
};

export function EmailsTab({ leadId }: EmailsTabProps) {
  const [emails, setEmails] = useState<IEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<IEmail | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/emails?leadId=${leadId}&limit=50`);
      const json = await res.json();
      setEmails(json.emails ?? []);
    } catch {
      toast.error("Failed to load emails");
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowCompose(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Compose
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-10">
          <Mail className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No emails yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Thread list */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {emails.map((email, i) => (
              <motion.button
                key={email._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(selected?._id === email._id ? null : email)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border last:border-0",
                  "hover:bg-muted/20 transition-colors",
                  selected?._id === email._id && "bg-muted/20"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-medium truncate">{email.subject}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(email.createdAt), "MMM d")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{email.body}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn("text-xs font-medium capitalize", STATUS_STYLE[email.status])}>
                    {email.status}
                  </span>
                  {email.openedAt && (
                    <span className="text-xs text-green-400 flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> Opened
                    </span>
                  )}
                  {email.clickedAt && (
                    <span className="text-xs text-blue-400 flex items-center gap-0.5">
                      <MousePointerClick className="w-3 h-3" /> Clicked
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Email detail */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="mb-4 pb-4 border-b border-border">
                <h3 className="text-sm font-semibold mb-1">{selected.subject}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>To: <span className="text-foreground">{selected.to}</span></span>
                  <span>From: <span className="text-foreground">{selected.from}</span></span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(selected.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                {(selected.openedAt || selected.clickedAt) && (
                  <div className="flex gap-3 mt-2">
                    {selected.openedAt && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Opened {format(new Date(selected.openedAt), "MMM d 'at' h:mm a")}
                      </span>
                    )}
                    {selected.clickedAt && (
                      <span className="text-xs text-blue-400 flex items-center gap-1">
                        <MousePointerClick className="w-3.5 h-3.5" />
                        Clicked {format(new Date(selected.clickedAt), "MMM d 'at' h:mm a")}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <pre className="whitespace-pre-wrap text-sm font-sans text-muted-foreground leading-relaxed">
                {selected.body}
              </pre>
            </motion.div>
          )}
        </div>
      )}

      <ComposeEmailDialog
        open={showCompose}
        onOpenChange={setShowCompose}
        defaultLeadId={leadId}
        onSuccess={load}
      />
    </div>
  );
}
