// grading.js
// Pure grading logic — no side effects, so it can be reused for the live
// preview in the form AND called again server-side/in tests if needed.

export const HTF_REACTIONS = [
  { value: "sweep_reject", label: "Liquidity sweep + reject" },
  { value: "engulf", label: "Engulfing at level" },
  { value: "wick_reject", label: "Wick rejection" },
  { value: "none", label: "No clean reaction" },
];

export const LEVEL_STATUS = ["Untested", "Retested", "Broken"];

export function gradeSetup({
  htfReaction,
  ltfStructureBreak,
  ltfEma200Reclaim,
  ltfFvgTagged,
  htfDirection,
  ltfDirection,
}) {
  const htfConfirmed = htfReaction !== "none";
  // LTF trigger = Change of Character (structure break) AND a 200 EMA reclaim/break in the
  // bias direction. FVG is an optional tag only — it doesn't gate the grade, since the actual
  // trigger is CHoCH + EMA200, not the FVG.
  const ltfConfirmed = Boolean(ltfStructureBreak) && Boolean(ltfEma200Reclaim);
  const directionsAgree = htfDirection === ltfDirection;

  if (htfConfirmed && ltfConfirmed && directionsAgree) {
    return { grade: "full", label: "Full Match" };
  }
  if (htfConfirmed && ltfConfirmed && !directionsAgree) {
    return { grade: "none", label: "No Match" };
  }
  if (htfConfirmed || ltfConfirmed) {
    return { grade: "partial", label: "Partial Match" };
  }
  return { grade: "none", label: "No Match" };
}

export const GRADE_STYLES = {
  full: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    dot: "bg-emerald-500",
  },
  partial: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    dot: "bg-amber-500",
  },
  none: {
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-300",
    dot: "bg-rose-500",
  },
};
