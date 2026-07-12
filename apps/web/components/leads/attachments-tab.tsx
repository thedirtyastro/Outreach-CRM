"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Paperclip, Upload, Trash2, FileText, Image, Archive,
  File, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IAttachment } from "@outreach/shared";

interface AttachmentsTabProps {
  leadId: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <Image className="w-5 h-5 text-blue-400" />;
  if (mimeType === "application/pdf") return <FileText className="w-5 h-5 text-red-400" />;
  if (mimeType.includes("zip")) return <Archive className="w-5 h-5 text-yellow-400" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

export function AttachmentsTab({ leadId }: AttachmentsTabProps) {
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/attachments`);
      const json = await res.json();
      setAttachments(Array.isArray(json) ? json : []);
    } catch {
      toast.error("Failed to load attachments");
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => { void load(); }, [load]);

  async function uploadFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("leadId", leadId);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }
      const attachment = await res.json();
      setAttachments((prev) => [attachment, ...prev]);
      toast.success(`${file.name} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void uploadFile(file);
  }

  async function handleDelete(attachment: IAttachment) {
    try {
      const res = await fetch(
        `/api/leads/${leadId}/attachments?attachmentId=${attachment.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
      toast.success("Attachment deleted");
    } catch {
      toast.error("Failed to delete attachment");
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-border/80 hover:bg-muted/10"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={handleFileInput}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.zip,.txt"
        />
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground text-center">
              Drop a file here or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground/60">
              PDF, Images, Docs, ZIP · Max 10MB
            </p>
          </>
        )}
      </div>

      {/* File list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-6">
          <Paperclip className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No attachments yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att, i) => (
            <motion.div
              key={att.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:border-border/80 transition-colors"
            >
              <FileIcon mimeType={att.mimeType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{att.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(att.size)} · {format(new Date(att.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Download
                </a>
                <button
                  onClick={() => handleDelete(att)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete attachment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
