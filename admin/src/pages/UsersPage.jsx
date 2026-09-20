import { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { createUserAccount, deleteUserAccount } from '../services/userService';

const emptyForm = {
  email: '',
  password: '',
  displayName: '',
  role: 'user',
  language: 'en',
};

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load();
  }, []);

  const makeAdmin = async (id) => {
    await updateDoc(doc(db, 'users', id), { role: 'admin' });
    load();
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setMessage('');
    try {
      const email = form.email;
      await createUserAccount(form);
      setForm(emptyForm);
      setMessage(`User ${email} created.`);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Delete Firestore profile for ${email}? (Auth account remains in Firebase Console)`)) {
      return;
    }
    await deleteUserAccount(id);
    await load();
  };

  return (
    <div>
      <h2>Users</h2>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Add user</h3>
        <form onSubmit={handleCreate} className="form-grid">
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </label>
          <label>
            Display name
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            Language
            <select
              value={form.language}
              onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="vi">Tiếng Việt</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="th">ภาษาไทย</option>
              <option value="km">ភាសាខ្មែរ</option>
            </select>
          </label>
          <button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create user'}
          </button>
        </form>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Language</th>
              <th>Onboarding</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.displayName}</td>
                <td>{item.email}</td>
                <td>{item.role || 'user'}</td>
                <td>{item.language || 'en'}</td>
                <td>{item.onboardingComplete ? 'Done' : 'Pending'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  {item.role !== 'admin' && (
                    <button type="button" onClick={() => makeAdmin(item.id)}>
                      Make admin
                    </button>
                  )}
                  <button type="button" onClick={() => handleDelete(item.id, item.email)}>
                    Delete profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
