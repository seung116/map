# Korea Travel Map

## Local run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

This repository is set up for GitHub Pages.

1. Push changes to `main`.
2. In GitHub repository settings, enable Pages deployment from GitHub Actions if prompted.
3. Every push to `main` will build and deploy automatically.

## Shared storage

If you want records to sync across phones, create a Firebase project on the free Spark plan, enable Authentication, Firestore, and Storage, then set the values from `.env.example` in a local `.env` file.

For GitHub Pages deployment, add the same values as repository secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_APP_ID`
- `VITE_BOOTSTRAP_ADMIN_UID` if you need one first admin account to be auto-promoted

## Firebase limits and access control

This app uses Firebase Authentication, Firestore, and Firebase Storage.

Recommended no-cost guardrails:

- Use Email/Password Authentication only.
- Keep Firestore reads under 50K/day, writes under 20K/day, deletes under 20K/day, and stored data under 1 GiB.
- Store photos in Firebase Storage under `users/{uid}/travel-records/...`.
- Add a Google Cloud budget alert for the billing account.

After the first admin account signs up, set that user's Firestore document in `users/{uid}` to:

```json
{
  "approved": true,
  "role": "admin"
}
```

Use these Firestore rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function bootstrapAdmin() {
      return request.auth != null
        && request.auth.uid == "KHOQ7B536lZC7BFq39AnA459mry1";
    }

    function signedIn() {
      return request.auth != null;
    }

    function userDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    function isApproved() {
      return signedIn() && userDoc().data.approved == true;
    }

    function isAdmin() {
      return bootstrapAdmin() || (signedIn() && userDoc().data.role == "admin");
    }

    match /users/{userId} {
      allow create: if signedIn()
        && request.auth.uid == userId
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.email == request.auth.token.email
        && request.resource.data.approved == false
        && request.resource.data.role == "member";
      allow read: if signedIn() && (request.auth.uid == userId || isAdmin());
      allow update, delete: if isAdmin();

      match /travelRecords/{recordId} {
        allow read: if isAdmin() || (isApproved() && request.auth.uid == userId);
        allow delete: if isApproved() && request.auth.uid == userId;
        allow create, update: if isApproved()
          && request.auth.uid == userId
          && request.resource.data.userId == request.auth.uid;
      }
    }
  }
}
```

Use these Storage rules:

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function signedIn() {
      return request.auth != null;
    }

    function userDoc() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid));
    }

    function isApproved() {
      return signedIn() && userDoc().data.approved == true;
    }

    match /users/{userId}/travel-records/{allPaths=**} {
      allow read, write: if isApproved() && request.auth.uid == userId;
    }
  }
}
```
