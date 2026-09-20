import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { seedImportedCourse } from '../services/seedData';
import { uploadAllTranslationsFromPublic } from '../services/translationService';

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    courses: 0,
    units: 0,
    lessons: 0,
    users: 0,
    posts: 0,
    translations: 0,
  });
  const [seeding, setSeeding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const loadCounts = async () => {
    const names = ['courses', 'units', 'lessons', 'users', 'communityPosts', 'translations'];
    const entries = await Promise.all(
      names.map(async (name) => {
        const snap = await getCountFromServer(collection(db, name));
        return [name, snap.data().count];
      })
    );
    setCounts(Object.fromEntries(entries));
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setMessage('');
    try {
      const result = await seedImportedCourse();
      setMessage(
        `Seeded ${result.courseId}: ${result.units} units, ${result.lessons} lessons.`
      );
      await loadCounts();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleUploadTranslations = async () => {
    setUploading(true);
    setMessage('');
    try {
      await uploadAllTranslationsFromPublic();
      setMessage('All translations uploaded to Firebase (6 languages).');
      await loadCounts();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="grid">
        <div className="card"><div className="stat">{counts.courses || 0}</div>Courses</div>
        <div className="card"><div className="stat">{counts.units || 0}</div>Units</div>
        <div className="card"><div className="stat">{counts.lessons || 0}</div>Lessons</div>
        <div className="card"><div className="stat">{counts.users || 0}</div>Users</div>
        <div className="card"><div className="stat">{counts.posts || 0}</div>Posts</div>
        <div className="card"><div className="stat">{counts.translations || 0}</div>Languages</div>
      </div>

      <div className="card">
        <h3>Course setup</h3>
        <p>Seed General Psychology course (20 units, 199 lessons) from bundled JSON.</p>
        <button type="button" onClick={handleSeed} disabled={seeding}>
          {seeding ? 'Seeding...' : 'Seed General Psychology Course'}
        </button>
      </div>

      <div className="card">
        <h3>Translations</h3>
        <p>Upload all UI strings and translated course files to Firebase for the mobile app.</p>
        <button type="button" onClick={handleUploadTranslations} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload All Translations'}
        </button>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </div>
    </div>
  );
}
