"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadForm } from "@/components/leads/lead-form";
import { useLeadsStore } from "@/store/leads.store";
import type { ILead } from "@outreach/shared";

export default function LeadsPage() {
  const [showForm, setShowForm] = useState(false);
  const { addLead } = useLeadsStore();

  function handleLeadCreated(lead: ILead) {
    addLead(lead);
  }

  return (
    <>
      <Header title="Leads" description="Manage your outreach pipeline" />
      <div className="flex-1 p-6 space-y-4 max-w-[1400px]">
        <LeadsToolbar onAddLead={() => setShowForm(true)} />
        <LeadsTable />
        <LeadForm
          open={showForm}
          onOpenChange={setShowForm}
          onSuccess={handleLeadCreated}
        />
      </div>
    </>
  );
}
