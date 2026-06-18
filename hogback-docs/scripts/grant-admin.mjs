#!/usr/bin/env node

/**
 * Grants Hogback admin access to a Firebase Auth user.
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 *   node scripts/grant-admin.mjs developer@hogbacktech.com
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "node:fs";

const email = process.argv[2];
const projectId = process.env.FIREBASE_PROJECT_ID || "hogback-docs";
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!email) {
  console.error("Usage: node scripts/grant-admin.mjs <email>");
  process.exit(1);
}

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

const auth = getAuth();
const db = getFirestore();

const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { admin: true });
await db.collection("admins").doc(user.uid).set({
  email,
  createdAt: FieldValue.serverTimestamp(),
});

console.log(`Granted admin access to ${email} (${user.uid}).`);
