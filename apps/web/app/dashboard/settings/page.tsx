"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Loader2, Download, Upload, RefreshCw, Copy,
  Check, Eye, EyeOff, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, signOut } from "@/lib/auth-client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { ISettings } from "@outreach/shared";

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── TIMEZONES ────────────────────────────────────────────────────────────────

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileForm {
  name: string;
  email: string;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [settings, setSettings] = useState<ISettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Profile
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  // Notification toggles
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    followUpReminder: true,
    meetingReminder: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    signature: "",
    trackOpens: true,
    trackClicks: true,
  });
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Timezone
  const [timezone, setTimezone] = useState("UTC");
  const [isSavingTimezone, setIsSavingTimezone] = useState(false);

  // API key
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // CSV Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  // ─── Load settings ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data: ISettings = await res.json();
        setSettings(data);
        setNotifications(data.notifications);
        setEmailSettings({
          signature: data.emailSettings?.signature ?? "",
          trackOpens: data.emailSettings?.trackOpens ?? true,
          trackClicks: data.emailSettings?.trackClicks ?? true,
        });
        setTimezone(data.timezone ?? "UTC");
        setApiKey(data.apiKey ?? null);
      } catch {
        // silent
      } finally {
        setIsLoadingSettings(false);
      }
    }
    void loadSettings();
  }, []);

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function saveSettings(patch: Partial<ISettings>) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to save settings");
    return res.json();
  }

  async function onProfileSave(data: ProfileForm) {
    setIsSavingProfile(true);
    try {
      // better-auth exposes updateUser
      // For now we update the name via a PATCH — extend if better-auth exposes the endpoint
      await new Promise((r) => setTimeout(r, 300)); // placeholder for profile API
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function onSaveNotifications() {
    setIsSavingNotifications(true);
    try {
      await saveSettings({ notifications });
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setIsSavingNotifications(false);
    }
  }

  async function onSaveEmailSettings() {
    setIsSavingEmail(true);
    try {
      await saveSettings({
        emailSettings: {
          signature: emailSettings.signature,
          trackOpens: emailSettings.trackOpens,
          trackClicks: emailSettings.trackClicks,
        },
      });
      toast.success("Email settings saved");
    } catch {
      toast.error("Failed to save email settings");
    } finally {
      setIsSavingEmail(false);
    }
  }

  async function onSaveTimezone() {
    setIsSavingTimezone(true);
    try {
      await saveSettings({ timezone });
      toast.success("Timezone saved");
    } catch {
      toast.error("Failed to save timezone");
    } finally {
      setIsSavingTimezone(false);
    }
  }

  async function onRegenerateApiKey() {
    setIsRegeneratingKey(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate_api_key" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setApiKey(data.apiKey);
      setShowApiKey(true);
      toast.success("API key regenerated");
    } catch {
      toast.error("Failed to regenerate API key");
    } finally {
      setIsRegeneratingKey(false);
    }
  }

  async function copyApiKey() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExport() {
    try {
      const res = await fetch("/api/leads/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Failed to export data");
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: text,
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Import failed");
        return;
      }

      setImportResult(json.data);
      toast.success(json.message ?? "Import complete");
    } catch {
      toast.error("Failed to process CSV file");
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const masked = apiKey
    ? `${apiKey.slice(0, 12)}${"•".repeat(Math.max(0, apiKey.length - 16))}${apiKey.slice(-4)}`
    : null;

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 p-4 sm:p-6 max-w-2xl space-y-5">

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Section title="Profile" description="Update your personal information">
            <form onSubmit={handleSubmit(onProfileSave)} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user?.image ?? undefined} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                    {user?.name ? getInitials(user.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" {...register("name")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled
                    className="opacity-60"
                  />
                </div>
              </div>
              <Button type="submit" size="sm" disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Section>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Section title="Notifications" description="Control how you receive alerts">
            <div className="divide-y divide-border">
              <Toggle
                label="Email notifications"
                description="Receive updates via email"
                checked={notifications.email}
                onChange={(v) => setNotifications((p) => ({ ...p, email: v }))}
              />
              <Toggle
                label="Desktop notifications"
                description="Browser push notifications"
                checked={notifications.desktop}
                onChange={(v) => setNotifications((p) => ({ ...p, desktop: v }))}
              />
              <Toggle
                label="Follow-up reminders"
                checked={notifications.followUpReminder}
                onChange={(v) => setNotifications((p) => ({ ...p, followUpReminder: v }))}
              />
              <Toggle
                label="Meeting reminders"
                checked={notifications.meetingReminder}
                onChange={(v) => setNotifications((p) => ({ ...p, meetingReminder: v }))}
              />
            </div>
            <div className="mt-4">
              <Button
                size="sm"
                onClick={onSaveNotifications}
                disabled={isSavingNotifications}
              >
                {isSavingNotifications ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save preferences"
                )}
              </Button>
            </div>
          </Section>
        </motion.div>

        {/* Email Settings */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Section title="Email Settings" description="Signature, tracking, and defaults">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signature">Email signature</Label>
                <Textarea
                  id="signature"
                  placeholder="Best regards,&#10;Your Name"
                  rows={4}
                  value={emailSettings.signature}
                  onChange={(e) =>
                    setEmailSettings((p) => ({ ...p, signature: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Appended to the bottom of every outgoing email
                </p>
              </div>

              <div className="divide-y divide-border">
                <Toggle
                  label="Track email opens"
                  description="Know when recipients open your emails"
                  checked={emailSettings.trackOpens}
                  onChange={(v) => setEmailSettings((p) => ({ ...p, trackOpens: v }))}
                />
                <Toggle
                  label="Track link clicks"
                  description="Know when links in emails are clicked"
                  checked={emailSettings.trackClicks}
                  onChange={(v) => setEmailSettings((p) => ({ ...p, trackClicks: v }))}
                />
              </div>

              <Button size="sm" onClick={onSaveEmailSettings} disabled={isSavingEmail}>
                {isSavingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save email settings"
                )}
              </Button>
            </div>
          </Section>
        </motion.div>

        {/* Timezone */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Section title="Timezone" description="Used for scheduling and date display">
            <div className="flex items-center gap-3">
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={onSaveTimezone} disabled={isSavingTimezone}>
                {isSavingTimezone ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </Section>
        </motion.div>

        {/* API Key */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Section
            title="API Key"
            description="Use this key to authenticate the browser extension with your CRM account"
          >
            <div className="space-y-3">
              {apiKey ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={showApiKey ? apiKey : (masked ?? "")}
                      readOnly
                      className="pr-10 font-mono text-xs"
                    />
                    <button
                      onClick={() => setShowApiKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showApiKey ? "Hide API key" : "Show API key"}
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    onClick={copyApiKey}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No API key generated yet. Generate one to pair with the browser extension.
                </p>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={onRegenerateApiKey}
                  disabled={isRegeneratingKey}
                >
                  {isRegeneratingKey ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {apiKey ? "Regenerate key" : "Generate key"}
                </Button>
                {apiKey && (
                  <p className="text-xs text-muted-foreground">
                    Regenerating will invalidate the current key
                  </p>
                )}
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Data Import/Export */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Section title="Data" description="Export all leads to CSV or import from a file">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Import CSV
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportFile}
                  aria-label="Import CSV file"
                />
              </div>

              {/* Import result */}
              {importResult && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm space-y-1">
                  <p className="font-medium text-green-400">
                    ✓ {importResult.created} leads imported
                    {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
                  </p>
                  {importResult.errors.length > 0 && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                        {importResult.errors.length} row error{importResult.errors.length !== 1 ? "s" : ""}
                      </summary>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside pl-1">
                        {importResult.errors.slice(0, 10).map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li>… and {importResult.errors.length - 10} more</li>
                        )}
                      </ul>
                    </details>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                CSV must have a{" "}
                <code className="bg-muted px-1 rounded text-xs">name</code> and{" "}
                <code className="bg-muted px-1 rounded text-xs">platform</code> column.
                Optional columns: company, email, linkedin, status, priority, tags (semicolon-separated), and more.
              </p>
            </div>
          </Section>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <Section title="Account">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs text-muted-foreground">
                  Sign out of your account on this device
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </Section>
        </motion.div>
      </div>
    </>
  );
}
