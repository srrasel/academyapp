import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function UnitsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    id: '',
    courseId: 'main',
    order: 1,
    title: '',
    description: '',
    totalLessons: 5,
  });

  const load = async () => {
    const snap = await getDocs(collection(db, 'units'));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    const id = form.id || `unit-${form.order}`;
    await setDoc(doc(db, 'units', id), {
      courseId: form.courseId,
      order: Number(form.order),
      title: form.title,
      description: form.description,
      totalLessons: Number(form.totalLessons),
      total: Number(form.totalLessons),
      updatedAt: Date.now(),
    }, { merge: true });
    setForm({ id: '', courseId: 'main', order: items.length + 1, title: '', description: '', totalLessons: 5 });
    load();
  };

  return (
    <div>
      <h2>Units</h2>
      <form className="card" onSubmit={save}>
        <div className="form-grid">
          <div><label>Unit ID</label><input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="unit-7" /></div>
          <div><label>Order</label><input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
          <div><label>Course ID</label><input value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} /></div>
          <div><label>Total lessons</label><input type="number" value={form.totalLessons} onChange={(e) => setForm({ ...form, totalLessons: e.target.value })} /></div>
        </div>
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <label>Description</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit">Save Unit</button>
      </form>

      <div className="card">
        <table>
          <thead><tr><th>Order</th><th>Title</th><th>Course</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.order}</td>
                <td>{item.title}</td>
                <td>{item.courseId}</td>
                <td className="row-actions">
                  <button className="secondary" type="button" onClick={() => setForm({ id: item.id, courseId: item.courseId, order: item.order, title: item.title, description: item.description || '', totalLessons: item.totalLessons || 5 })}>Edit</button>
                  <button type="button" onClick={() => deleteDoc(doc(db, 'units', item.id)).then(load)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
