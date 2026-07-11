/**
 * server/services/template.service.ts
 *
 * Database operations for the Template entity.
 */

import { connectDB, Template } from "@outreach/database";
import { createTemplateSchema } from "@outreach/shared/validations";
import type { ITemplate, PaginatedResponse } from "@outreach/shared";

/** Paginated list of templates. */
export async function listTemplates(
  userId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<ITemplate>> {
  await connectDB();

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, limit);
  const skip = (safePage - 1) * safeLimit;

  const [data, total] = await Promise.all([
    Template.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Template.countDocuments({ userId }),
  ]);

  return {
    data: data as unknown as ITemplate[],
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

/** Create a template. */
export async function createTemplate(
  userId: string,
  input: unknown
): Promise<{ template: ITemplate | null; validationError: string | null }> {
  await connectDB();

  const parsed = createTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { template: null, validationError: parsed.error.issues[0]?.message ?? "Validation error" };
  }

  const template = await Template.create({ ...parsed.data, userId });
  return { template: template.toJSON() as unknown as ITemplate, validationError: null };
}

/** Update a template. */
export async function updateTemplate(
  id: string,
  userId: string,
  updates: Record<string, unknown>
): Promise<ITemplate | null> {
  await connectDB();
  const template = await Template.findOneAndUpdate({ _id: id, userId }, updates, { new: true }).lean();
  return template as unknown as ITemplate | null;
}

/** Delete a template. */
export async function deleteTemplate(id: string, userId: string): Promise<boolean> {
  await connectDB();
  const result = await Template.findOneAndDelete({ _id: id, userId });
  return result !== null;
}
