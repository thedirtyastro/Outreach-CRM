"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pin, PinOff, Trash2, Plus, Loader2, StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { INote } from "@outreach/shared";

interface NotesTabProps {
  leadId: string;
}

export function NotesTab({ leadId }: NotesTabProps) {
  const [notes, setNotes] = useState<INote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notes?leadId=${leadId}`);
      const json = await res.json();
      setNotes(json ?? []);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => { void load(); }, [load]);

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, content: draft.trim() }),
      });
      if (!res.ok) throw new Error();
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setDraft("");
      setComposing(false);
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  async function handlePin(note: INote) {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setNotes((prev) =>
        prev
          .map((n) => (n.id === note.id ? updated : n))
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
      );
    } catch {
      toast.error("Failed to update note");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  }

  return (
    <div className="space-y-4">
      {/* Add note */}
      <AnimatePresence initial={false}>
        {composing ? (
          <motion.div
            key="composer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <Textarea
              autoFocus
              placeholder="Write a note… (markdown supported)"
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Escape") { setComposing(false); setDraft(""); }
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSave();
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">⌘ + Enter to save · Esc to cancel</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setComposing(false); setDraft(""); }}>
                  Cancel
                </Button>
                <Button size="sm" disabled={!draft.trim() || saving} onClick={handleSave}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Note"}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setComposing(true)}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add a note…
          </motion.button>
        )}
      </AnimatePresence>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-10">
          <StickyNote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "group bg-card border rounded-xl p-4",
                note.isPinned ? "border-primary/30 bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <pre className="flex-1 text-sm whitespace-pre-wrap font-sans leading-relaxed wrap-break-word">
                  {note.content}
                </pre>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => handlePin(note)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    aria-label={note.isPinned ? "Unpin" : "Pin"}
                  >
                    {note.isPinned
                      ? <PinOff className="w-3.5 h-3.5" />
                      : <Pin className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {note.isPinned && (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
