export default function FirebaseSetup() {
  return (
    <div className="login-page">
      <div className="card login-card">
        <h2>Firebase setup required</h2>
        <p>
          The admin panel needs Firebase credentials. Create <code>admin/.env</code> from{' '}
          <code>admin/.env.example</code> and paste your Firebase config values.
        </p>
        <pre
          style={{
            background: '#f3f4f6',
            padding: 12,
            borderRadius: 8,
            fontSize: 12,
            overflow: 'auto',
          }}
        >
{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}
        </pre>
        <p>Then restart the admin server:</p>
        <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, fontSize: 12 }}>
          npm run admin
        </pre>
      </div>
    </div>
  );
}
