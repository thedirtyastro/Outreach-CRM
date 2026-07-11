"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, Phone, Linkedin, Twitter, Github, Globe,
  MapPin, Building2, Calendar, Clock, Edit, Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { StatusBadge, PriorityBadge, PlatformBadge } from "@/components/leads/lead-badge";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatCurrency } from "@/lib/utils";
import type { ILead } from "@/types";

function InfoRow({ icon: Icon, label, value, href }: {
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

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<ILead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
    }
    void load();
  }, [id, router]);

  async function handleDelete() {
    if (!confirm("Delete this lead? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Lead deleted");
        router.push("/dashboard/leads");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Lead" />
        <div className="flex-1 p-6">
          <div className="space-y-4 animate-pulse max-w-5xl">
            <div className="h-8 bg-muted/50 rounded w-48" />
            <div className="h-48 bg-muted/30 rounded-xl" />
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
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6">
        <div className="mb-4">
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
          {/* Left: Profile */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Header card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                    {getInitials(lead.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold truncate">{lead.name}</h2>
                  {lead.designation && (
                    <p className="text-sm text-muted-foreground truncate">{lead.designation}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <PlatformBadge platform={lead.platform} />
                <StatusBadge status={lead.status} />
                <PriorityBadge priority={lead.priority} />
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact</h3>
              <InfoRow icon={Mail} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} href={`tel:${lead.phone}`} />
              <InfoRow icon={Building2} label="Company" value={lead.company} />
              <InfoRow icon={MapPin} label="Location" value={lead.location} />
            </div>

            {/* Social links */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Social</h3>
              <InfoRow icon={Linkedin} label="LinkedIn" value={lead.linkedin} href={lead.linkedin} />
              <InfoRow icon={Twitter} label="Twitter" value={lead.twitter} href={lead.twitter} />
              <InfoRow icon={Github} label="GitHub" value={lead.github} href={lead.github} />
              <InfoRow icon={Globe} label="Website" value={lead.website} href={lead.website} />
            </div>

            {/* Financials */}
            {(lead.budget || lead.expectedRevenue) && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financials</h3>
                {lead.budget && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="text-sm font-medium tabular-nums">{formatCurrency(lead.budget)}</span>
                  </div>
                )}
                {lead.expectedRevenue && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-sm text-muted-foreground">Expected</span>
                    <span className="text-sm font-medium tabular-nums text-green-400">{formatCurrency(lead.expectedRevenue)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Timeline</h3>
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
          </motion.div>

          {/* Right: Activity + Bio */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Bio */}
            {lead.bio && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{lead.bio}</p>
              </div>
            )}

            {/* Activity */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Activity Timeline</h3>
              <ActivityFeed leadId={lead._id} limit={20} />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
