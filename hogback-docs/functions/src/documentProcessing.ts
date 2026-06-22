import * as admin from "firebase-admin";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { logger } from "firebase-functions";

function extractPlainText(fileName: string, buffer: Buffer): string {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".txt") || lower.endsWith(".md")) {
    return buffer.toString("utf8");
  }

  // Phase 2: add pdf-parse and mammoth for PDF/DOCX extraction.
  return "";
}

export const processUploadedDocument = onObjectFinalized(
  { region: "us-west1" },
  async (event) => {
    const object = event.data;
    const filePath = object.name;

    if (!filePath || !filePath.startsWith("organizations/")) {
      return;
    }

    const [, orgId, , documentId] = filePath.split("/");

    if (!orgId || !documentId) {
      logger.warn("Unexpected storage path", { filePath });
      return;
    }

    const bucket = admin.storage().bucket(object.bucket);
    const [buffer] = await bucket.file(filePath).download();
    const searchText = extractPlainText(object.name ?? "", buffer);

    const docRef = admin
      .firestore()
      .collection("organizations")
      .doc(orgId)
      .collection("documents")
      .doc(documentId);

    const existing = await docRef.get();
    if (!existing.exists) {
      logger.warn("Document metadata missing for uploaded file", { orgId, documentId });
      return;
    }

    await docRef.update({
      searchText: searchText || existing.data()?.searchText || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      hasEmbedding: false,
    });

    logger.info("Processed document upload", { orgId, documentId, bytes: buffer.length });
  },
);
