import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Category, CreateOrganizationInput, DocumentRecord, Organization } from "@shared/types";

function toIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof value === "string" ? value : new Date().toISOString();
}

function mapOrganization(id: string, data: DocumentData): Organization {
  return {
    id,
    name: String(data.name ?? ""),
    code: String(data.code ?? ""),
    active: Boolean(data.active),
    isDemo: Boolean(data.isDemo),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function mapCategory(id: string, data: DocumentData): Category {
  return {
    id,
    name: String(data.name ?? ""),
    parentId: data.parentId ? String(data.parentId) : null,
    sortOrder: Number(data.sortOrder ?? 0),
    createdAt: toIso(data.createdAt),
  };
}

function mapDocument(id: string, data: DocumentData): DocumentRecord {
  return {
    id,
    title: String(data.title ?? ""),
    categoryId: String(data.categoryId ?? ""),
    storagePath: String(data.storagePath ?? ""),
    fileName: String(data.fileName ?? ""),
    mimeType: String(data.mimeType ?? ""),
    sizeBytes: Number(data.sizeBytes ?? 0),
    searchText: String(data.searchText ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    synonyms: Array.isArray(data.synonyms) ? data.synonyms.map(String) : [],
    hasEmbedding: Boolean(data.hasEmbedding),
    uploadedAt: toIso(data.uploadedAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function listOrganizations(): Promise<Organization[]> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), "organizations"), orderBy("name")),
  );
  return snapshot.docs.map((entry) => mapOrganization(entry.id, entry.data()));
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), "organizations", orgId));
  if (!snapshot.exists()) return null;
  return mapOrganization(snapshot.id, snapshot.data());
}

export async function createOrganization(input: CreateOrganizationInput): Promise<string> {
  const code = input.code.trim().toUpperCase();
  const orgRef = doc(collection(getFirebaseDb(), "organizations"));
  const batch = writeBatch(getFirebaseDb());

  batch.set(orgRef, {
    name: input.name.trim(),
    code,
    active: true,
    isDemo: Boolean(input.isDemo),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(getFirebaseDb(), "orgCodes", code), {
    orgId: orgRef.id,
    active: true,
  });

  await batch.commit();
  return orgRef.id;
}

export async function updateOrganization(
  orgId: string,
  updates: Partial<Pick<Organization, "name" | "active">>,
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "organizations", orgId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function listCategories(orgId: string): Promise<Category[]> {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseDb(), "organizations", orgId, "categories"),
      orderBy("sortOrder"),
    ),
  );
  return snapshot.docs.map((entry) => mapCategory(entry.id, entry.data()));
}

export async function createCategory(
  orgId: string,
  name: string,
  sortOrder: number,
): Promise<string> {
  const categoryRef = doc(collection(getFirebaseDb(), "organizations", orgId, "categories"));
  await setDoc(categoryRef, {
    name: name.trim(),
    parentId: null,
    sortOrder,
    createdAt: serverTimestamp(),
  });
  return categoryRef.id;
}

export async function listDocuments(orgId: string): Promise<DocumentRecord[]> {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseDb(), "organizations", orgId, "documents"),
      orderBy("title"),
    ),
  );
  return snapshot.docs.map((entry) => mapDocument(entry.id, entry.data()));
}

export async function createDocumentMetadata(
  orgId: string,
  input: {
    title: string;
    categoryId: string;
    storagePath: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    searchText?: string;
    tags?: string[];
    synonyms?: string[];
  },
): Promise<string> {
  const documentRef = doc(collection(getFirebaseDb(), "organizations", orgId, "documents"));
  await setDoc(documentRef, {
    title: input.title.trim(),
    categoryId: input.categoryId,
    storagePath: input.storagePath,
    fileName: input.fileName,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    searchText: input.searchText ?? "",
    tags: input.tags ?? [],
    synonyms: input.synonyms ?? [],
    hasEmbedding: false,
    uploadedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return documentRef.id;
}

export async function isCurrentUserAdmin(uid: string): Promise<boolean> {
  const snapshot = await getDoc(doc(getFirebaseDb(), "admins", uid));
  return snapshot.exists();
}
