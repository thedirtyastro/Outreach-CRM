import type { Database } from "@outreach/database";

// Check if our table type satisfies GenericTable constraint
type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: { foreignKeyName: string; columns: string[]; isOneToOne?: boolean; referencedRelation: string; referencedColumns: string[] }[];
};

// Test emails table
type EmailsTable = Database["public"]["Tables"]["emails"];
type _TestRow = EmailsTable["Row"] extends Record<string, unknown> ? "OK" : "FAIL_ROW";
type _TestInsert = EmailsTable["Insert"] extends Record<string, unknown> ? "OK" : "FAIL_INSERT";
type _TestUpdate = EmailsTable["Update"] extends Record<string, unknown> ? "OK" : "FAIL_UPDATE";
type _TestRels = EmailsTable["Relationships"] extends GenericTable["Relationships"] ? "OK" : "FAIL_RELS";
type _TestFull = EmailsTable extends GenericTable ? "OK" : "FAIL_FULL";

const _r: _TestRow = "OK";
const _i: _TestInsert = "OK";
const _u: _TestUpdate = "OK";
const _rel: _TestRels = "OK";
const _f: _TestFull = "OK";

export { _r, _i, _u, _rel, _f };
