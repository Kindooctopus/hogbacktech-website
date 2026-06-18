import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";
import { exchangeOrgCode } from "./orgAuth";
import { searchDocuments } from "./search";
import { processUploadedDocument } from "./documentProcessing";

admin.initializeApp();

setGlobalOptions({ region: "us-west1", maxInstances: 10 });

export { exchangeOrgCode, searchDocuments, processUploadedDocument };
