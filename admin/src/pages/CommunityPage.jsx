import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function CommunityPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const snap = await getDocs(collection(db, 'communityPosts'));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Community Posts</h2>
      <div className="card">
        <table>
          <thead><tr><th>Author</th><th>Content</th><th>Likes</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.authorName}</td>
                <td>{item.content}</td>
                <td>{item.likes ?? 0}</td>
                <td>
                  <button type="button" onClick={() => deleteDoc(doc(db, 'communityPosts', item.id)).then(load)}>
                    Delete
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
