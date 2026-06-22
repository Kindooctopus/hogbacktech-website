#!/usr/bin/env node

/**
 * Seeds the HOGBACK-DEMO organization with starter categories and sample documents.
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 *   node scripts/seed-demo.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectId = process.env.FIREBASE_PROJECT_ID || "hogback-docs";
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath || !existsSync(credentialsPath)) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(readFileSync(credentialsPath, "utf8"))),
    projectId,
  });
}

const db = getFirestore();
const demoCode = "HOGBACK-DEMO";

const demoCategories = [
  { name: "Policies", sortOrder: 1 },
  { name: "SOPs", sortOrder: 2 },
  { name: "Training", sortOrder: 3 },
];

const demoDocuments = [
  {
    category: "Policies",
    title: "Personnel Handbook Overview",
    fileName: "personnel-handbook.txt",
    searchText:
      "Personnel policies covering payroll schedules, payday processing, pay periods, and work cycle expectations for all staff.",
    tags: ["personnel", "policy"],
    synonyms: ["payroll", "payday", "pay period", "workcycle"],
  },
  {
    category: "SOPs",
    title: "Vehicle Response SOP",
    fileName: "vehicle-response-sop.txt",
    searchText:
      "Standard operating procedure for apparatus response, staging, and on-scene coordination.",
    tags: ["fleet", "response"],
    synonyms: ["apparatus", "engine", "truck"],
  },
  {
    category: "Training",
    title: "Annual Safety Training Guide",
    fileName: "safety-training.txt",
    searchText:
      "Required annual training modules for workplace safety, equipment checks, and incident reporting.",
    tags: ["training", "safety"],
    synonyms: ["orientation", "compliance"],
  },
];

async function seed() {
  const existingCode = await db.collection("orgCodes").doc(demoCode).get();
  if (existingCode.exists) {
    console.log(`Demo org code ${demoCode} already exists. Skipping seed.`);
    return;
  }

  const orgRef = db.collection("organizations").doc();
  const batch = db.batch();

  batch.set(orgRef, {
    name: "Hogback Docs Demo",
    code: demoCode,
    active: true,
    isDemo: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  batch.set(db.collection("orgCodes").doc(demoCode), {
    orgId: orgRef.id,
    active: true,
  });

  const categoryIds = new Map();

  for (const category of demoCategories) {
    const categoryRef = orgRef.collection("categories").doc();
    categoryIds.set(category.name, categoryRef.id);
    batch.set(categoryRef, {
      name: category.name,
      parentId: null,
      sortOrder: category.sortOrder,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  for (const document of demoDocuments) {
    const documentRef = orgRef.collection("documents").doc();
    batch.set(documentRef, {
      title: document.title,
      categoryId: categoryIds.get(document.category),
      storagePath: `organizations/${orgRef.id}/documents/${documentRef.id}/${document.fileName}`,
      fileName: document.fileName,
      mimeType: "text/plain",
      sizeBytes: document.searchText.length,
      searchText: document.searchText,
      tags: document.tags,
      synonyms: document.synonyms,
      hasEmbedding: false,
      uploadedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`Seeded demo organization with code ${demoCode} (orgId: ${orgRef.id}).`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
