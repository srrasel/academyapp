import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadCourseMedia } from '../services/storageService';

const emptyForm = {
  id: '',
  unitId: '7',
  courseId: 'main',
  order: 1,
  title: '',
  type: 'video',
  duration: '15 min',
  videoUrl: '',
  audioUrl: '',
  thumbnailUrl: '',
  about: '',
  description: '',
};

export default function LessonsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = async () => {
    const snap = await getDocs(collection(db, 'lessons'));
    setItems(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => Number(a.order) - Number(b.order))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const lessonKey = form.id || `${form.unitId}-${form.order}`;

  const handleUpload = async (file, kind, field) => {
    if (!file) return;
    setUploading(kind);
    setUploadProgress(0);
    try {
      const { url } = await uploadCourseMedia(
        file,
        { unitId: form.unitId, lessonId: lessonKey, kind },
        setUploadProgress
      );
      setForm((prev) => ({ ...prev, [field]: url }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading('');
      setUploadProgress(0);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    const id = lessonKey;
    const payload = {
      unitId: String(form.unitId),
      courseId: form.courseId,
      order: Number(form.order),
      title: form.title,
      type: form.type,
      duration: form.duration,
      videoUrl: form.videoUrl,
      audioUrl: form.audioUrl,
      thumbnailUrl: form.thumbnailUrl,
      about: form.about,
      description: form.description,
      updatedAt: Date.now(),
    };

    if (form.type === 'quiz') {
      payload.questions = form.questions || [
        {
          id: '1',
          question: 'Which of the following is a common response to trauma?',
          options: [
            { id: 'A', text: 'Immediate complete recovery without support' },
            { id: 'B', text: 'Hypervigilance and heightened stress response', correct: true },
            { id: 'C', text: 'Complete loss of all emotional capacity' },
            { id: 'D', text: 'Only physical symptoms, never emotional' },
          ],
          explanation: 'Hypervigilance is a common trauma response.',
        },
      ];
    }

    await setDoc(doc(db, 'lessons', id), payload, { merge: true });
    setForm(emptyForm);
    load();
  };

  return (
    <div>
      <h2>Lessons</h2>
      <form className="card" onSubmit={save}>
        <div className="form-grid">
          <div><label>Lesson ID</label><input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="7-1" /></div>
          <div><label>Unit ID</label><input value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} /></div>
          <div><label>Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
          <div>
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
        </div>
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <label>Duration</label>
        <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />

        {(form.type === 'video' || form.type === 'audio') && (
          <div className="upload-block">
            <label>Media upload</label>
            {form.type === 'video' && (
              <>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleUpload(e.target.files?.[0], 'video', 'videoUrl')}
                />
                {uploading === 'video' && <p>Uploading video… {uploadProgress}%</p>}
                <label>Video URL</label>
                <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="Or paste a URL" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files?.[0], 'thumbnail', 'thumbnailUrl')}
                />
                {uploading === 'thumbnail' && <p>Uploading thumbnail… {uploadProgress}%</p>}
                <label>Thumbnail URL</label>
                <input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />
              </>
            )}
            {form.type === 'audio' && (
              <>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleUpload(e.target.files?.[0], 'audio', 'audioUrl')}
                />
                {uploading === 'audio' && <p>Uploading audio… {uploadProgress}%</p>}
                <label>Audio URL</label>
                <input value={form.audioUrl} onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} placeholder="Or paste a URL" />
              </>
            )}
          </div>
        )}

        <label>About / Description</label>
        <textarea rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
        <button type="submit" disabled={Boolean(uploading)}>Save Lesson</button>
      </form>

      <div className="card">
        <table>
          <thead><tr><th>Unit</th><th>Order</th><th>Title</th><th>Type</th><th>Media</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.unitId}</td>
                <td>{item.order}</td>
                <td>{item.title}</td>
                <td>{item.type}</td>
                <td>{item.videoUrl || item.audioUrl ? '✓' : '—'}</td>
                <td className="row-actions">
                  <button className="secondary" type="button" onClick={() => setForm({ ...emptyForm, ...item })}>Edit</button>
                  <button type="button" onClick={() => deleteDoc(doc(db, 'lessons', item.id)).then(load)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
