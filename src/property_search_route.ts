import { z } from "zod";
import { embedPropertyText, infraiRequest } from "./infrai_property_client.ts";
import { rankForMaintenance, type PropertyMatch } from "./maintenance_ranking.ts";

const requestBody = z.object({
  query: z.string().min(3),
  collection: z.string().min(1),
  top_k: z.number().int().min(1).max(10).default(5)
});

export async function POST(request: Request): Promise<Response> {
  const parsed = requestBody.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Provide query, collection, and an optional top_k." }, { status: 400 });

  try {
    const embedding = await embedPropertyText(parsed.data.query);
    const result = await infraiRequest<{ matches: PropertyMatch[] }>("/vector/query", "POST", {
      collection: parsed.data.collection,
      embedding,
      top_k: parsed.data.top_k,
      include_metadata: true
    });
    return Response.json({ query: parsed.data.query, matches: rankForMaintenance(result.matches) });
  } catch (error) {
    const status = error instanceof Error && "status" in error ? Number(error.status) : 502;
    return Response.json({ error: error instanceof Error ? error.message : "Search could not be completed." }, { status });
  }
}
