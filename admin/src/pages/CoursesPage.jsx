import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function CoursesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    id: 'main',
    title: '',
    subtitle: '',
    description: '',
  });

  const load = async () => {
    const snap = await getDocs(collection(db, 'courses'));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    await setDoc(doc(db, 'courses', form.id), {
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      stats: { units: 20, lessons: 100, hours: '40+' },
      totalUnits: 20,
      learnings: [],
      updatedAt: Date.now(),
    }, { merge: true });
    setForm({ id: 'main', title: '', subtitle: '', description: '' });
    load();
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'courses', id));
    load();
  };

  return (
    <div>
      <h2>Courses</h2>
      <form className="card" onSubmit={save}>
        <div className="form-grid">
          <div>
            <label>Course ID</label>
            <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
          </div>
          <div>
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
        </div>
        <label>Subtitle</label>
        <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <label>Description</label>
        <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit">Save Course</button>
      </form>

      <div className="card">
        <table>
          <thead>
            <tr><th>ID</th><th>Title</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td className="row-actions">
                  <button className="secondary" type="button" onClick={() => setForm({ id: item.id, title: item.title || '', subtitle: item.subtitle || '', description: item.description || '' })}>Edit</button>
                  <button type="button" onClick={() => remove(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
