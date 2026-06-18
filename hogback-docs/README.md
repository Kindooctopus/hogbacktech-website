# Hogback Docs Platform

Document management platform for **Hogback Technologies** client organizations.

- **Admin portal** — manage organizations, categories, and document uploads
- **Firebase backend** — auth, Firestore, Storage, Cloud Functions
- **iOS app** — Phase 3 (org-code sign-in, browse, search)
- **Demo org** — `HOGBACK-DEMO` for App Store showcase

## Project structure

```
hogback-docs/
├── admin/          Next.js admin portal (docs.hogbacktech.com)
├── functions/      Firebase Cloud Functions
├── scripts/        Setup and seed scripts
├── shared/         Shared TypeScript types
├── firestore.rules
└── storage.rules
```

## Phase 1 setup

### 1. Create Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project: **hogback-docs**
3. Enable **Authentication** → Email/Password
4. Create **Firestore** database (production mode)
5. Enable **Storage**
6. Upgrade to **Blaze** plan (required for Cloud Functions)

### 2. Register a web app

1. Project settings → Add app → Web
2. Copy config values into `admin/.env.local`:

```bash
cp admin/.env.example admin/.env.local
```

Fill in all `NEXT_PUBLIC_FIREBASE_*` values from Firebase.

### 3. Install dependencies

```bash
cd hogback-docs
npm install
npm --prefix admin install
npm --prefix functions install
```

### 4. Deploy Firebase rules and functions

```bash
firebase login
firebase use hogback-docs
npm run functions:build
firebase deploy --only firestore:rules,storage,functions
```

### 5. Create your admin account

1. Firebase Console → Authentication → Add user (your email)
2. Copy the user's **User UID** from the Users table

**If service account key download is blocked**, grant admin manually in Firestore:

1. Firestore → create collection `admins` → document ID = your **User UID**
2. Add field `email` (string) with your email
3. Deploy rules: `firebase deploy --only firestore:rules,storage --project hogback-docs`

**If key download works**, you can use the script instead:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
node scripts/grant-admin.mjs developer@hogbacktech.com
```

### 6. Seed the demo organization

```bash
npm run seed:demo
```

This creates org code **`HOGBACK-DEMO`** with sample categories and searchable documents (including payroll/payday synonym examples).

### 7. Run the admin portal locally

```bash
npm run admin:dev
```

Open [http://localhost:3001](http://localhost:3001)

## Admin portal features (Phase 1)

- Sign in with Hogback admin credentials
- Create client organizations with unique codes
- Manage categories per organization
- Upload documents (PDF, Word, text)
- Add search tags and synonym groups per document

## Cloud Functions

| Function | Purpose |
|----------|---------|
| `exchangeOrgCode` | iOS/Android sign-in via organization code |
| `searchDocuments` | Keyword + synonym search (semantic search in Phase 2) |
| `processUploadedDocument` | Extract text after upload (PDF/DOCX in Phase 2) |

## Deploy admin to docs.hogbacktech.com

Recommended: **Vercel** or **Firebase Hosting**

### Vercel

1. Import the repo, set root directory to `hogback-docs/admin`
2. Add environment variables from `.env.local`
3. Add custom domain `docs.hogbacktech.com` in Cloudflare DNS

### Firebase Hosting

```bash
cd admin && npm run build
firebase init hosting
firebase deploy --only hosting
```

## Security model

- **Admins** — Firebase Auth users with `admin: true` custom claim
- **Mobile users** — exchange org code for scoped custom token (`orgId` claim)
- **Firestore rules** — users can only read their own organization's data
- **Demo org** — public via `HOGBACK-DEMO` code on App Store

## Roadmap

- [x] Phase 1 — Firebase + admin portal + demo org
- [ ] Phase 2 — PDF/DOCX text extraction, Vertex AI semantic search
- [ ] Phase 3 — iOS app (SwiftUI)
- [ ] Phase 4 — Android app
- [ ] Phase 5 — Push notifications, offline caching

## iOS app integration (preview)

The iOS app will call `exchangeOrgCode` with the user's organization code:

```swift
// Pseudocode
let result = try await functions.httpsCallable("exchangeOrgCode").call(["code": code])
let token = result.data["token"]
try await Auth.auth().signIn(withCustomToken: token)
```

Then browse `organizations/{orgId}/categories` and `documents`, and search via `searchDocuments`.
