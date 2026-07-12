/**
 * server/services/template.service.ts
 */

import { supabase } from "@outreach/database/client";
import { createTemplateSchema } from "@outreach/shared/validations";
import type { ITemplate, PaginatedResponse } from "@outreach/shared";

function rowToTemplate(row: Record<string, unknown>): ITemplate {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    subject: row.subject as string,
    body: row.body as string,
    type: row.type as ITemplate["type"],
    variables: (row.variables as string[]) ?? [],
    isDefault: row.is_default as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listTemplates(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<ITemplate>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, limit);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  const { data, count, error } = await supabase
    .from("templates")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map(rowToTemplate),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function createTemplate(
  userId: string,
  input: unknown
): Promise<{ template: ITemplate | null; validationError: string | null }> {
  const parsed = createTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { template: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const { data, error } = await supabase
    .from("templates")
    .insert({
      user_id: userId,
      name: parsed.data.name,
      subject: parsed.data.subject,
      body: parsed.data.body,
      type: parsed.data.type,
      variables: parsed.data.variables,
      is_default: parsed.data.isDefault,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { template: rowToTemplate(data), validationError: null };
}

export async function updateTemplate(
  id: string,
  userId: string,
  updates: Record<string, unknown>
): Promise<ITemplate | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
  if (updates.body !== undefined) dbUpdates.body = updates.body;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.variables !== undefined) dbUpdates.variables = updates.variables;
  if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;

  const { data, error } = await supabase
    .from("templates")
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data ? rowToTemplate(data) : null;
}

export async function deleteTemplate(id: string, userId: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("templates")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
