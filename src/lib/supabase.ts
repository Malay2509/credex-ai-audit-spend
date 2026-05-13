import { createClient } from "@supabase/supabase-js";
import { AuditResult } from "@/types/audit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

// We export a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Lead = {
  id?: string;
  email: string;
  company_name?: string | null;
  role: string;
  team_size: string;
  created_at?: string;
};

export type SavedAudit = {
  id?: string;
  lead_id: string; // Foreign key
  audit_data: AuditResult; // Stored as JSONB
  total_savings: number;
  created_at?: string;
};

export async function saveLeadAndAudit(lead: Omit<Lead, "id" | "created_at">, auditData: AuditResult, totalSavings: number) {
  if (supabaseUrl === "https://dummy.supabase.co" || supabaseAnonKey === "dummy") {
    console.warn("Supabase credentials missing, simulating save...");
    return { auditId: "demo-id-" + Date.now() };
  }

  // 1. Insert lead
  const { data: leadData, error: leadError } = await supabase
    .from("leads")
    .insert([lead])
    .select("id")
    .single();

  if (leadError) throw new Error("Failed to save lead: " + leadError.message);

  // 2. Insert audit
  const { data: auditResult, error: auditError } = await supabase
    .from("audits")
    .insert([
      {
        lead_id: leadData.id,
        audit_data: auditData,
        total_savings: totalSavings,
      },
    ])
    .select("id")
    .single();

  if (auditError) throw new Error("Failed to save audit: " + auditError.message);

  return { auditId: auditResult.id };
}
