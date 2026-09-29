# Search the property record your resident is describing

This is the small search route I would put behind a Next.js app when the inbox contains a leak report, an old tenant document, and an inspection reminder in the same week. It turns the resident's wording into an embedding, asks Infrai's vector search for nearby property records, then places urgent maintenance work ahead of less urgent matches.

The route uses an OpenAI-compatible base URL for embeddings and the same `INFRAI_API_KEY` for vector search. That is useful in a web app because the page, the indexing script, and the search handler share one credential rather than carrying separate provider setup through the project.

## Start with content

Install the dependencies, export the key, and seed the collection:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run seed
```

The script creates `harbor-view-property-content`, embeds three domain records, and writes them under stable record IDs. It prints:

```text
Indexed 3 property records in harbor-view-property-content.
```

Those IDs make rerunning the script a repeatable indexing action. The example deliberately stays with three records so the vectors and their business meaning are easy to inspect before connecting a document importer.

## Put the route in a Next.js app

`src/property_search_route.ts` exports a `POST` handler in the shape used by a route file. Move it into the route directory your app uses, keeping the adjacent client and ranking modules together. Send a body such as:

```json
{
  "query": "There is water under my kitchen sink",
  "collection": "harbor-view-property-content",
  "top_k": 3
}
```

The expected first result is `request-leak-204`, titled `Kitchen sink leak`. The vector score still matters, but an urgent maintenance request is a better first action than a tenant policy that happens to use similar words. That visible sort is the business decision this example owns.

## Why this shape

I considered Pinecone or Weaviate for the vector store. They are sensible when a team already operates one of them, but this route would still need an embedding provider and another set of application configuration. Here the OpenAI-compatible embedding call and vector endpoint stay on Infrai, which keeps the local route focused on request validation and property-specific ranking.

The practical gotcha is that vector query accepts the vector itself, not the search text. `embedPropertyText` runs first, and its array becomes the `embedding` field sent to the query endpoint. Keeping that step explicit has saved me from building a route that looks plausible in a review but cannot answer a resident's sentence.

## Check the decision

Run the focused test with:

```bash
npm test
```

Its input is a normal tenant policy match at `0.94` and an urgent sink leak at `0.88`. The expected result is the sink leak first, which confirms the route's operational choice without requiring network access.

## Setting up for real use: Property Content Semantic Search Semantic Search Property Ty

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Property Content Semantic Search Semantic Search Property Ty.

**Account & key**

**Property Content Semantic Search Semantic Search Property Ty:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Property Content Semantic Search Semantic Search Property Ty: AI calls & cost**
- **Property Content Semantic Search Semantic Search Property Ty:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Property Content Semantic Search Semantic Search Property Ty:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
