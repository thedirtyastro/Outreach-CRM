"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Loader2, User, Bell, Mail, Key, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useSession, signOut } from "@/lib/auth-client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ProfileForm {
  name: string;
  email: string;
}

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
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

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const [isSaving, setIsSaving] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    followUpReminder: true,
    meetingReminder: true,
  });

  const [emailSettings, setEmailSettings] = useState({
    trackOpens: true,
    trackClicks: true,
  });

  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  async function onProfileSave(data: ProfileForm) {
    setIsSaving(true);
    // In a real app, call a profile update API
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Profile updated");
    setIsSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  async function handleExport() {
    toast.info("Export started — your data will be ready shortly");
  }

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 p-6 max-w-2xl space-y-5">
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
                  <Input id="email" type="email" {...register("email")} disabled className="opacity-60" />
                </div>
              </div>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Save Changes"}
              </Button>
            </form>
          </Section>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
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
          </Section>
        </motion.div>

        {/* Email tracking */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Email Settings" description="Configure email tracking and defaults">
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
          </Section>
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Data" description="Export or import your CRM data">
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
            </div>
          </Section>
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Section title="Account">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
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
