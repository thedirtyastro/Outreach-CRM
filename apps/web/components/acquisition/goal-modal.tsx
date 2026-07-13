"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SCHEDULE_OPTIONS = [
  { value: "today_only", label: "Today Only" },
  { value: "daily", label: "Repeat Daily" },
  { value: "weekdays", label: "Weekdays Only" },
  { value: "custom", label: "Custom" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function GoalModal({ isOpen, onClose, onSave }: GoalModalProps) {
  const [form, setForm] = useState({
    targetContacts: 10,
    linkedinTarget: 4,
    twitterTarget: 2,
    instagramTarget: 1,
    githubTarget: 1,
    emailTarget: 2,
    callsTarget: 0,
    meetingsTarget: 2,
    revenueGoal: 0,
    workingHours: 8,
    notes: "",
    schedule: "daily",
    customDays: [] as number[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/acquisition/goals")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const g = json.data;
          setForm({
            targetContacts: g.targetContacts,
            linkedinTarget: g.linkedinTarget,
            twitterTarget: g.twitterTarget,
            instagramTarget: g.instagramTarget,
            githubTarget: g.githubTarget,
            emailTarget: g.emailTarget,
            callsTarget: g.callsTarget,
            meetingsTarget: g.meetingsTarget,
            revenueGoal: g.revenueTarget,
            workingHours: g.workingHours,
            notes: g.notes ?? "",
            schedule: g.schedule,
            customDays: g.customDays ?? [],
          });
        }
      })
      .catch(() => {});
  }, [isOpen]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/acquisition/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Goal saved");
        onSave();
      } else {
        toast.error(json.error ?? "Failed to save goal");
      }
    } catch {
      toast.error("Failed to save goal");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-card border border-border rounded-t-xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Configure Daily Goal</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <NumberField label="Total Contacts Target" value={form.targetContacts} onChange={(v) => setForm({ ...form, targetContacts: v })} />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="LinkedIn" value={form.linkedinTarget} onChange={(v) => setForm({ ...form, linkedinTarget: v })} />
            <NumberField label="Twitter/X" value={form.twitterTarget} onChange={(v) => setForm({ ...form, twitterTarget: v })} />
            <NumberField label="Instagram" value={form.instagramTarget} onChange={(v) => setForm({ ...form, instagramTarget: v })} />
            <NumberField label="GitHub" value={form.githubTarget} onChange={(v) => setForm({ ...form, githubTarget: v })} />
            <NumberField label="Cold Emails" value={form.emailTarget} onChange={(v) => setForm({ ...form, emailTarget: v })} />
            <NumberField label="Calls" value={form.callsTarget} onChange={(v) => setForm({ ...form, callsTarget: v })} />
          </div>
          <NumberField label="Meetings Target" value={form.meetingsTarget} onChange={(v) => setForm({ ...form, meetingsTarget: v })} />
          <NumberField label="Revenue Goal (₹)" value={form.revenueGoal} onChange={(v) => setForm({ ...form, revenueGoal: v })} />
          <NumberField label="Working Hours" value={form.workingHours} onChange={(v) => setForm({ ...form, workingHours: v })} />

          {/* Schedule */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Schedule</label>
            <div className="flex flex-wrap gap-2">
              {SCHEDULE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, schedule: opt.value })}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    form.schedule === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/20 border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {form.schedule === "custom" && (
            <div className="flex gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const days = form.customDays.includes(i)
                      ? form.customDays.filter((d) => d !== i)
                      : [...form.customDays, i];
                    setForm({ ...form, customDays: days });
                  }}
                  className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                    form.customDays.includes(i)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full p-3 bg-muted/20 border border-border rounded-lg text-sm resize-none h-20"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Goal"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full p-2 bg-muted/20 border border-border rounded-lg text-sm tabular-nums"
      />
    </div>
  );
}

