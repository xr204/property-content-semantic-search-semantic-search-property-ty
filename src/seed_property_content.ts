import { embedPropertyText, infraiRequest } from "./infrai_property_client.ts";

const collection = process.env.PROPERTY_COLLECTION ?? "harbor-view-property-content";
const records = [
  { id: "request-leak-204", text: "Maintenance request: water leaking below unit 204 kitchen sink.", metadata: { kind: "maintenance_request", urgency: "urgent", title: "Kitchen sink leak" } },
  { id: "document-pet-policy", text: "Tenant document: pets must be registered before moving into Harbor View.", metadata: { kind: "tenant_document", urgency: "normal", title: "Pet registration" } },
  { id: "inspection-smoke-alarms", text: "Inspection reminder: test smoke alarms in every Harbor View unit this Friday.", metadata: { kind: "inspection_reminder", urgency: "normal", title: "Smoke alarm inspection" } }
];

async function main(): Promise<void> {
  const firstEmbedding = await embedPropertyText(records[0].text);
  await infraiRequest("/vector/collection/create", "POST", {
    collection,
    dimension: firstEmbedding.length,
    metric: "cosine",
    metadata: { domain: "property-management" }
  });
  const vectors = await Promise.all(records.map(async (record, index) => ({
    id: record.id,
    metadata: record.metadata,
    embedding: index === 0 ? firstEmbedding : await embedPropertyText(record.text)
  })));
  await infraiRequest("/vector/upsert", "POST", { collection, vectors });
  console.log(`Indexed ${vectors.length} property records in ${collection}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
