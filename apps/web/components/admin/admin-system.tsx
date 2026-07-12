"use client";

import { useEffect, useState } from "react";
import {
  Database,
  Server,
  Mail,
  HardDrive,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SystemStatus {
  database: { status: "healthy" | "degraded" | "down"; latencyMs: number };
  api: { status: "healthy" | "degraded" | "down"; uptime: string };
  email: { status: "healthy" | "degraded" | "down"; queueSize: number };
  storage: { status: "healthy" | "degraded" | "down"; usedMb: number };
}

export function AdminSystem() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/system");
      const json = await res.json();
      setStatus(json);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!status) {
    return <p className="text-muted-foreground">Failed to load system status.</p>;
  }

  const services = [
    {
      name: "Database (Supabase)",
      icon: Database,
      status: status.database.status,
      detail: `Latency: ${status.database.latencyMs}ms`,
    },
    {
      name: "API Server",
      icon: Server,
      status: status.api.status,
      detail: `Uptime: ${status.api.uptime}`,
    },
    {
      name: "Email Service (Resend)",
      icon: Mail,
      status: status.email.status,
      detail: `Queue: ${status.email.queueSize} pending`,
    },
    {
      name: "Storage",
      icon: HardDrive,
      status: status.storage.status,
      detail: `Used: ${status.storage.usedMb} MB`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Service Status</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.name}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{service.detail}</p>
                  </div>
                </div>
                <StatusBadge status={service.status} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-muted-foreground">Runtime</span>
              <span className="font-medium">Next.js 16 (Edge/Node)</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium">Supabase (PostgreSQL)</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-muted-foreground">Auth</span>
              <span className="font-medium">better-auth v1</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">Resend</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-muted-foreground">Region</span>
              <span className="font-medium">AP Southeast 1</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-accent/30">
              <span className="text-muted-foreground">Node Version</span>
              <span className="font-medium">{typeof process !== "undefined" ? "20+" : "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    healthy: { icon: CheckCircle2, color: "text-green-400 bg-green-400/10", label: "Healthy" },
    degraded: { icon: AlertCircle, color: "text-yellow-400 bg-yellow-400/10", label: "Degraded" },
    down: { icon: XCircle, color: "text-red-400 bg-red-400/10", label: "Down" },
  }[status] ?? { icon: AlertCircle, color: "text-gray-400 bg-gray-400/10", label: "Unknown" };

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
}
