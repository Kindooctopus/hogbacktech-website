import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

type SearchRequest = {
  orgId: string;
  query: string;
  limit?: number;
};

type SearchHit = {
  id: string;
  title: string;
  categoryId: string;
  snippet: string;
  score: number;
};

type SearchResponse = {
  results: SearchHit[];
  mode: "keyword";
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

function scoreDocument(
  queryTokens: string[],
  fields: { title: string; searchText: string; tags: string[]; synonyms: string[] },
): { score: number; snippet: string } {
  const haystack = [
    fields.title,
    fields.searchText,
    fields.tags.join(" "),
    fields.synonyms.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (fields.title.toLowerCase().includes(token)) score += 4;
    if (fields.tags.some((tag) => tag.toLowerCase().includes(token))) score += 3;
    if (fields.synonyms.some((syn) => syn.toLowerCase().includes(token))) score += 3;
    if (haystack.includes(token)) score += 1;
  }

  const firstToken = queryTokens[0] ?? "";
  const snippetSource = fields.searchText || fields.title;
  const index = snippetSource.toLowerCase().indexOf(firstToken);
  const snippet =
    index >= 0
      ? snippetSource.slice(Math.max(0, index - 40), index + 80).trim()
      : fields.title;

  return { score, snippet };
}

export const searchDocuments = onCall<SearchRequest, Promise<SearchResponse>>(
  { cors: true },
  async (request) => {
    if (!request.auth?.token?.orgId && !request.auth?.token?.admin) {
      throw new HttpsError("permission-denied", "Authentication required.");
    }

    const orgId = request.data?.orgId?.trim();
    const query = request.data?.query?.trim() ?? "";
    const limit = Math.min(request.data?.limit ?? 20, 50);

    if (!orgId) {
      throw new HttpsError("invalid-argument", "Organization ID is required.");
    }

    const callerOrgId = request.auth.token.orgId as string | undefined;
    const isAdmin = Boolean(request.auth.token.admin);

    if (!isAdmin && callerOrgId !== orgId) {
      throw new HttpsError("permission-denied", "Cannot search another organization.");
    }

    if (!query) {
      return { results: [], mode: "keyword" };
    }

    const queryTokens = tokenize(query);
    const snapshot = await admin
      .firestore()
      .collection("organizations")
      .doc(orgId)
      .collection("documents")
      .get();

    const results = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const { score, snippet } = scoreDocument(queryTokens, {
          title: String(data.title ?? ""),
          searchText: String(data.searchText ?? ""),
          tags: Array.isArray(data.tags) ? data.tags : [],
          synonyms: Array.isArray(data.synonyms) ? data.synonyms : [],
        });

        return {
          id: doc.id,
          title: String(data.title ?? "Untitled"),
          categoryId: String(data.categoryId ?? ""),
          snippet,
          score,
        };
      })
      .filter((hit) => hit.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return { results, mode: "keyword" };
  },
);

// Phase 2: semantic vector search via Vertex AI embeddings + Firestore findNearest.
