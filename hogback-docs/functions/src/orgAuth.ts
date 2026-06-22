import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

type ExchangeOrgCodeRequest = {
  code: string;
};

type ExchangeOrgCodeResponse = {
  token: string;
  orgId: string;
  orgName: string;
};

export const exchangeOrgCode = onCall<ExchangeOrgCodeRequest, Promise<ExchangeOrgCodeResponse>>(
  { cors: true },
  async (request) => {
    const rawCode = request.data?.code?.trim().toUpperCase();

    if (!rawCode) {
      throw new HttpsError("invalid-argument", "Organization code is required.");
    }

    const db = admin.firestore();
    const codeDoc = await db.collection("orgCodes").doc(rawCode).get();

    if (!codeDoc.exists || !codeDoc.data()?.active) {
      throw new HttpsError("not-found", "Invalid organization code.");
    }

    const orgId = codeDoc.data()?.orgId as string;
    const orgDoc = await db.collection("organizations").doc(orgId).get();

    if (!orgDoc.exists || !orgDoc.data()?.active) {
      throw new HttpsError("not-found", "Organization is not active.");
    }

    const orgName = orgDoc.data()?.name as string;
    const uid = `org_${orgId}_${rawCode}`;

    await admin.auth().getUser(uid).catch(async () => {
      await admin.auth().createUser({ uid, displayName: orgName });
    });

    const token = await admin.auth().createCustomToken(uid, {
      orgId,
      orgCode: rawCode,
      isDemo: Boolean(orgDoc.data()?.isDemo),
    });

    return { token, orgId, orgName };
  },
);
