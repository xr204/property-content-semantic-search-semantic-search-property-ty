export type PropertyMatch = {
  id: string;
  score: number;
  metadata?: { kind?: string; urgency?: string; title?: string };
};

export function rankForMaintenance(matches: PropertyMatch[]): PropertyMatch[] {
  return [...matches].sort((left, right) => {
    const leftUrgent = left.metadata?.urgency === "urgent" ? 1 : 0;
    const rightUrgent = right.metadata?.urgency === "urgent" ? 1 : 0;
    return rightUrgent - leftUrgent || right.score - left.score;
  });
}
