import { useEffect, useState } from 'react';
import {
  LOCALES,
  listTranslationLocales,
  uploadTranslationLocaleFromPublic,
  uploadAllTranslationsFromPublic,
} from '../services/translationService';

const LABELS = {
  en: 'English',
  zh: '中文',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  th: 'ภาษาไทย',
  km: 'ភាសាខ្មែរ',
};

export default function TranslationsPage() {
  const [remote, setRemote] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    const items = await listTranslationLocales();
    setRemote(items);
  };

  useEffect(() => {
    load();
  }, []);

  const uploadOne = async (locale) => {
    setUploading(locale);
    setMessage('');
    try {
      await uploadTranslationLocaleFromPublic(locale);
      setMessage(`Uploaded ${LABELS[locale] || locale} to Firebase.`);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(null);
    }
  };

  const uploadAll = async () => {
    setUploading('all');
    setMessage('');
    try {
      await uploadAllTranslationsFromPublic();
      setMessage('All languages uploaded to Firebase.');
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(null);
    }
  };

  const remoteMap = Object.fromEntries(remote.map((item) => [item.id, item]));

  return (
    <div>
      <h2>Translations</h2>
      <p>
        Upload bundled UI strings and course content (course, units, lessons) to Firebase.
        The mobile app downloads and caches them for offline use.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Upload to Firebase</h3>
        <p>Reads from local files synced by <code>npm run sync:translations</code>.</p>
        <button type="button" onClick={uploadAll} disabled={uploading}>
          {uploading === 'all' ? 'Uploading all...' : 'Upload All Languages'}
        </button>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Language</th>
              <th>Code</th>
              <th>Firebase status</th>
              <th>Last updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {LOCALES.map((locale) => {
              const item = remoteMap[locale];
              const updated = item?.updatedAt
                ? new Date(item.updatedAt).toLocaleString()
                : 'Not uploaded';
              return (
                <tr key={locale}>
                  <td>{LABELS[locale]}</td>
                  <td>{locale}</td>
                  <td>{item ? 'On Firebase' : 'Missing'}</td>
                  <td>{updated}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => uploadOne(locale)}
                      disabled={Boolean(uploading)}
                    >
                      {uploading === locale ? 'Uploading...' : 'Upload'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
