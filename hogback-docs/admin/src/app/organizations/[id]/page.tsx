"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ref, uploadBytes } from "firebase/storage";
import { AdminShell, Button, Card, Field, Input } from "@/components/ui";
import { RequireAdmin } from "@/components/RequireAdmin";
import {
  createCategory,
  createDocumentMetadata,
  getOrganization,
  listCategories,
  listDocuments,
} from "@/lib/firestore";
import { getFirebaseStorage } from "@/lib/firebase";
import type { Category, DocumentRecord, Organization } from "@shared/types";

export default function OrganizationPage() {
  const params = useParams<{ id: string }>();
  const orgId = params.id;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [tags, setTags] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  async function refresh() {
    const [org, nextCategories, nextDocuments] = await Promise.all([
      getOrganization(orgId),
      listCategories(orgId),
      listDocuments(orgId),
    ]);
    setOrganization(org);
    setCategories(nextCategories);
    setDocuments(nextDocuments);
    if (!selectedCategoryId && nextCategories[0]) {
      setSelectedCategoryId(nextCategories[0].id);
    }
  }

  useEffect(() => {
    refresh()
      .catch(() => setError("Unable to load organization."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  async function handleCreateCategory(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await createCategory(orgId, categoryName, categories.length + 1);
      setCategoryName("");
      setMessage("Category created.");
      await refresh();
    } catch {
      setError("Unable to create category.");
    }
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (!file || !selectedCategoryId) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const documentId = crypto.randomUUID();
      const storagePath = `organizations/${orgId}/documents/${documentId}/${file.name}`;
      const storageRef = ref(getFirebaseStorage(), storagePath);

      await uploadBytes(storageRef, file);
      await createDocumentMetadata(orgId, {
        title: documentTitle || file.name,
        categoryId: selectedCategoryId,
        storagePath,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        tags: tags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        synonyms: synonyms
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      });

      setDocumentTitle("");
      setTags("");
      setSynonyms("");
      setFile(null);
      setMessage("Document uploaded.");
      await refresh();
    } catch {
      setError("Unable to upload document.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <RequireAdmin>
      <AdminShell
        actions={
          <Link href="/dashboard">
            <Button variant="ghost">All organizations</Button>
          </Link>
        }
      >
        {loading ? (
          <p className="text-slate-400">Loading organization…</p>
        ) : !organization ? (
          <p className="text-red-300">Organization not found.</p>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold text-white">{organization.name}</h1>
              <p className="mt-2 text-slate-400">
                Organization code:{" "}
                <span className="font-mono text-docs">{organization.code}</span>
                {organization.isDemo ? " · Demo org for App Store" : ""}
              </p>
            </div>

            {message ? <p className="text-sm text-docs">{message}</p> : null}
            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Categories">
                <form className="mb-6 space-y-3" onSubmit={handleCreateCategory}>
                  <Field label="New category">
                    <Input
                      value={categoryName}
                      onChange={(event) => setCategoryName(event.target.value)}
                      placeholder="SOPs"
                      required
                    />
                  </Field>
                  <Button type="submit">Add category</Button>
                </form>
                <ul className="space-y-2 text-sm text-slate-300">
                  {categories.length === 0 ? (
                    <li className="text-slate-500">No categories yet.</li>
                  ) : (
                    categories.map((category) => (
                      <li key={category.id} className="rounded-lg border border-white/10 px-3 py-2">
                        {category.name}
                      </li>
                    ))
                  )}
                </ul>
              </Card>

              <Card title="Upload document">
                <form className="space-y-3" onSubmit={handleUpload}>
                  <Field label="Title">
                    <Input
                      value={documentTitle}
                      onChange={(event) => setDocumentTitle(event.target.value)}
                      placeholder="Vehicle Response SOP"
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      className="w-full rounded-lg border border-white/10 bg-navy-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-docs/40"
                      value={selectedCategoryId}
                      onChange={(event) => setSelectedCategoryId(event.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tags (comma separated)">
                    <Input
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                      placeholder="fleet, response"
                    />
                  </Field>
                  <Field label="Search synonyms (comma separated)">
                    <Input
                      value={synonyms}
                      onChange={(event) => setSynonyms(event.target.value)}
                      placeholder="payroll, payday, pay period"
                    />
                  </Field>
                  <Field label="File">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.md"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                      required
                    />
                  </Field>
                  <Button type="submit" disabled={uploading || categories.length === 0}>
                    {uploading ? "Uploading…" : "Upload document"}
                  </Button>
                </form>
              </Card>
            </div>

            <Card title="Documents">
              {documents.length === 0 ? (
                <p className="text-slate-500">No documents uploaded yet.</p>
              ) : (
                <div className="divide-y divide-white/10">
                  {documents.map((document) => (
                    <div key={document.id} className="py-4">
                      <p className="font-medium text-white">{document.title}</p>
                      <p className="text-sm text-slate-400">
                        {categoryMap.get(document.categoryId) ?? "Uncategorized"} · {document.fileName}
                      </p>
                      {document.synonyms.length > 0 ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Synonyms: {document.synonyms.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </AdminShell>
    </RequireAdmin>
  );
}
