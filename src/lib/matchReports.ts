import { supabase } from "./supabase";
import { calculateMatchScore, type Report } from "./matching";

type ReportWithUser = Report & {
  user_id: string;
};

export async function findMatches(newReport: ReportWithUser) {
  const oppositeType = newReport.report_type === "lost" ? "found" : "lost";

  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("report_type", oppositeType)
    .eq("status", "active")
    .neq("user_id", newReport.user_id);

  if (error) {
    throw new Error(`Could not load reports: ${error.message}`);
  }

  if (!reports || reports.length === 0) {
    return [];
  }

  const matches = reports
    .map((report) => {
      const lost =
        newReport.report_type === "lost" ? newReport : report;

      const found =
        newReport.report_type === "found" ? newReport : report;

      const result = calculateMatchScore(lost, found);

      return {
        lost_report_id: lost.id,
        found_report_id: found.id,
        match_score: result.score,
        match_reason: result.reason,
      };
    })
    .filter((match) => match.match_score >= 60);

  if (matches.length === 0) {
    return [];
  }

  const { data: insertedMatches, error: insertError } = await supabase
    .from("matches")
    .upsert(matches, {
      onConflict: "lost_report_id,found_report_id",
    })
    .select();

  if (insertError) {
    throw new Error(`Could not save matches: ${insertError.message}`);
  }

  return insertedMatches ?? [];
}