import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';

const keyPath = new URL('./lumi-f7098-firebase-adminsdk-fbsvc-3e460280f2.json', import.meta.url).pathname;
const corsConfig = JSON.parse(
  readFileSync(new URL('./cors.json', import.meta.url).pathname, 'utf8')
);

const auth = new GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/devstorage.full_control'],
});

const client = await auth.getClient();
const token = (await client.getAccessToken()).token;

const candidates = [
  'lumi-f7098.firebasestorage.app',
  'lumi-f7098.appspot.com',
];

for (const bucket of candidates) {
  const res = await fetch(
    `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ cors: corsConfig }),
    }
  );
  const body = await res.json();
  if (res.ok) {
    console.log(`CORS set on "${bucket}".`);
    console.log('CORS config now:', JSON.stringify(body.cors, null, 2));
    process.exit(0);
  } else {
    console.log(`"${bucket}": ${res.status} — ${body?.error?.message}`);
  }
}
