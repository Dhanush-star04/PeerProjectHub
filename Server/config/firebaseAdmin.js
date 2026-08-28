import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync(new URL('../firebase-service-account.json', import.meta.url))
);

const app = initializeApp({
  credential: cert(serviceAccount),
});

const adminAuth = getAuth(app);

export default adminAuth;
