export type Organization = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
};

export type DocumentRecord = {
  id: string;
  title: string;
  categoryId: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  searchText: string;
  tags: string[];
  synonyms: string[];
  hasEmbedding: boolean;
  uploadedAt: string;
  updatedAt: string;
};

export type OrgCodeIndex = {
  orgId: string;
  active: boolean;
};

export type CreateOrganizationInput = {
  name: string;
  code: string;
  isDemo?: boolean;
};

export type SearchResult = {
  id: string;
  title: string;
  categoryId: string;
  snippet: string;
  score: number;
};
