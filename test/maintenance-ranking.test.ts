import assert from "node:assert/strict";
import test from "node:test";
import { rankForMaintenance } from "../src/maintenance_ranking.ts";

test("an urgent repair wins over a slightly closer policy document", () => {
  const ranked = rankForMaintenance([
    { id: "pet-policy", score: 0.94, metadata: { kind: "tenant_document", urgency: "normal" } },
    { id: "leak-204", score: 0.88, metadata: { kind: "maintenance_request", urgency: "urgent" } }
  ]);
  assert.equal(ranked[0].id, "leak-204");
});
