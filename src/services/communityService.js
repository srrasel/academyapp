import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  limit,
  increment,
} from 'firebase/firestore';
import { db, auth, isFirebaseReady } from '../config/firebase';

const LOCAL_POSTS_KEY = '@academy_community_posts';
const LOCAL_LIKES_KEY = '@academy_community_likes';
const LOCAL_REACTIONS_KEY = '@academy_community_reactions';
const LOCAL_COMMENTS_KEY = '@academy_community_comments';
const LOCAL_COMMENT_VOTES_KEY = '@academy_community_comment_votes';

export const REACTION_EMOJIS = ['👍', '❤️', '🙌'];

function emptyReactions() {
  return REACTION_EMOJIS.reduce((acc, emoji) => {
    acc[emoji] = 0;
    return acc;
  }, {});
}

const SEED_POSTS = [
  {
    id: 'seed-1',
    authorName: 'Sarah J.',
    content:
      'Just finished Unit 7! The trauma-informed approach really changed how I think about coaching.',
    likes: 12,
    reactions: { '👍': 8, '❤️': 3, '🙌': 1 },
    commentCount: 1,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'seed-2',
    authorName: 'Mike T.',
    content: 'Anyone else struggling with the quiz on communication skills? Tips welcome!',
    likes: 5,
    reactions: { '👍': 2, '❤️': 1, '🙌': 2 },
    commentCount: 0,
    createdAt: Date.now() - 172800000,
  },
];

const SEED_COMMENTS = {
  'seed-1': [
    {
      id: 'seed-c1',
      postId: 'seed-1',
      authorName: 'Alex R.',
      content: 'Same here — that unit helped me reframe several client conversations.',
      likes: 2,
      dislikes: 0,
      createdAt: Date.now() - 80000000,
    },
  ],
};

function currentUserId() {
  return auth?.currentUser?.uid || null;
}

async function loadLocalPosts() {
  const raw = await AsyncStorage.getItem(LOCAL_POSTS_KEY);
  return raw ? JSON.parse(raw) : SEED_POSTS;
}

async function saveLocalPosts(posts) {
  await AsyncStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts));
}

async function loadLocalLikes() {
  const raw = await AsyncStorage.getItem(LOCAL_LIKES_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveLocalLikes(likes) {
  await AsyncStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(likes));
}

async function loadLocalReactions() {
  const raw = await AsyncStorage.getItem(LOCAL_REACTIONS_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveLocalReactions(reactions) {
  await AsyncStorage.setItem(LOCAL_REACTIONS_KEY, JSON.stringify(reactions));
}

async function loadLocalCommentsMap() {
  const raw = await AsyncStorage.getItem(LOCAL_COMMENTS_KEY);
  return raw ? JSON.parse(raw) : { ...SEED_COMMENTS };
}

async function saveLocalCommentsMap(map) {
  await AsyncStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(map));
}

async function loadLocalCommentVotes() {
  const raw = await AsyncStorage.getItem(LOCAL_COMMENT_VOTES_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveLocalCommentVotes(votes) {
  await AsyncStorage.setItem(LOCAL_COMMENT_VOTES_KEY, JSON.stringify(votes));
}

function normalizeReactions(reactions) {
  const base = emptyReactions();
  if (!reactions || typeof reactions !== 'object') return base;
  REACTION_EMOJIS.forEach((emoji) => {
    base[emoji] = Number(reactions[emoji]) || 0;
  });
  return base;
}

function mapPostDoc(d) {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    reactions: normalizeReactions(data.reactions),
    commentCount: Number(data.commentCount) || 0,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  };
}

async function loadRemoteUserMap(docId) {
  const uid = currentUserId();
  if (!isFirebaseReady() || !uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'meta', docId));
    return snap.exists() ? snap.data()?.map || {} : {};
  } catch {
    return null;
  }
}

async function saveRemoteUserMap(docId, map) {
  const uid = currentUserId();
  if (!isFirebaseReady() || !uid) return;
  try {
    await setDoc(
      doc(db, 'users', uid, 'meta', docId),
      { map, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch {
    // local map still works offline
  }
}

export async function fetchPosts() {
  if (isFirebaseReady()) {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(mapPostDoc);
    }
  }
  return loadLocalPosts();
}

export function subscribePosts(callback) {
  if (isFirebaseReady()) {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(
      q,
      async (snap) => {
        if (snap.empty) {
          callback(await loadLocalPosts());
          return;
        }
        callback(snap.docs.map(mapPostDoc));
      },
      async () => callback(await loadLocalPosts())
    );
  }

  loadLocalPosts().then(callback);
  return () => {};
}

export async function createPost({ userId, authorName, content }) {
  if (!content?.trim()) throw new Error('Post cannot be empty');

  const post = {
    id: String(Date.now()),
    userId,
    authorName,
    content: content.trim(),
    likes: 0,
    reactions: emptyReactions(),
    commentCount: 0,
    createdAt: Date.now(),
  };

  if (isFirebaseReady()) {
    const ref = await addDoc(collection(db, 'communityPosts'), {
      userId,
      authorName,
      content: content.trim(),
      likes: 0,
      reactions: emptyReactions(),
      commentCount: 0,
      createdAt: serverTimestamp(),
    });
    return { ...post, id: ref.id };
  }

  const posts = await loadLocalPosts();
  const next = [post, ...posts];
  await saveLocalPosts(next);
  return post;
}

export async function togglePostLike(postId, currentLikes = 0) {
  const likes = await loadLocalLikes();
  const remoteMap = (await loadRemoteUserMap('communityLikes')) || {};
  const merged = { ...remoteMap, ...likes };
  const liked = !merged[postId];
  merged[postId] = liked;
  if (!liked) delete merged[postId];

  await saveLocalLikes(merged);
  await saveRemoteUserMap('communityLikes', merged);

  const nextCount = liked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

  if (isFirebaseReady() && !String(postId).startsWith('seed-')) {
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        likes: nextCount,
      });
    } catch (error) {
      console.warn('community like sync failed', error?.message);
    }
  }

  const posts = await loadLocalPosts();
  const updated = posts.map((p) =>
    p.id === postId ? { ...p, likes: nextCount } : p
  );
  await saveLocalPosts(updated);

  return { liked, likes: nextCount };
}

export async function getUserLikedPosts() {
  const local = await loadLocalLikes();
  const remote = await loadRemoteUserMap('communityLikes');
  return { ...(remote || {}), ...local };
}

export async function getUserReactions() {
  const local = await loadLocalReactions();
  const remote = await loadRemoteUserMap('communityReactions');
  return { ...(remote || {}), ...local };
}

export async function toggleReaction(postId, emoji, currentReactions = {}) {
  if (!REACTION_EMOJIS.includes(emoji)) {
    return { reactions: normalizeReactions(currentReactions), userReaction: null };
  }

  const localReactions = await loadLocalReactions();
  const remoteMap = (await loadRemoteUserMap('communityReactions')) || {};
  const userReactions = { ...remoteMap, ...localReactions };
  const previous = userReactions[postId] || null;
  const next = previous === emoji ? null : emoji;
  const reactions = normalizeReactions(currentReactions);

  if (previous && reactions[previous] > 0) {
    reactions[previous] -= 1;
  }
  if (next) {
    reactions[next] = (reactions[next] || 0) + 1;
  }

  if (next) {
    userReactions[postId] = next;
  } else {
    delete userReactions[postId];
  }

  await saveLocalReactions(userReactions);
  await saveRemoteUserMap('communityReactions', userReactions);

  if (isFirebaseReady() && !String(postId).startsWith('seed-')) {
    try {
      await updateDoc(doc(db, 'communityPosts', postId), { reactions });
    } catch (error) {
      console.warn('community reaction sync failed', error?.message);
      throw new Error('Could not sync reaction. Please try again.');
    }
  }

  const posts = await loadLocalPosts();
  const updated = posts.map((p) => (p.id === postId ? { ...p, reactions } : p));
  await saveLocalPosts(updated);

  return { reactions, userReaction: next };
}

function mapCommentDoc(d, postId) {
  const data = d.data();
  return {
    id: d.id,
    postId,
    userId: data.userId || null,
    authorName: data.authorName || 'Learner',
    content: data.content || '',
    likes: Number(data.likes) || 0,
    dislikes: Number(data.dislikes) || 0,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  };
}

export async function fetchComments(postId) {
  if (isFirebaseReady() && !String(postId).startsWith('seed-')) {
    try {
      const q = query(
        collection(db, 'communityPosts', postId, 'comments'),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => mapCommentDoc(d, postId));
    } catch (error) {
      console.warn('community comments fetch failed', error?.message);
    }
  }

  const map = await loadLocalCommentsMap();
  return map[postId] || [];
}

export function subscribeComments(postId, callback) {
  if (isFirebaseReady() && !String(postId).startsWith('seed-')) {
    const q = query(
      collection(db, 'communityPosts', postId, 'comments'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => mapCommentDoc(d, postId))),
      async () => callback(await fetchComments(postId))
    );
  }

  fetchComments(postId).then(callback);
  return () => {};
}

export async function createComment({ postId, userId, authorName, content }) {
  if (!content?.trim()) throw new Error('Reply cannot be empty');
  if (!postId) throw new Error('Missing post');

  const comment = {
    id: `c-${Date.now()}`,
    postId,
    userId,
    authorName: authorName || 'Learner',
    content: content.trim(),
    likes: 0,
    dislikes: 0,
    createdAt: Date.now(),
  };

  if (isFirebaseReady() && !String(postId).startsWith('seed-')) {
    const ref = await addDoc(collection(db, 'communityPosts', postId, 'comments'), {
      userId,
      authorName: comment.authorName,
      content: comment.content,
      likes: 0,
      dislikes: 0,
      createdAt: serverTimestamp(),
    });
    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        commentCount: increment(1),
      });
    } catch (error) {
      console.warn('community commentCount sync failed', error?.message);
    }
    return { ...comment, id: ref.id };
  }

  const map = await loadLocalCommentsMap();
  const list = [...(map[postId] || []), comment];
  map[postId] = list;
  await saveLocalCommentsMap(map);

  const posts = await loadLocalPosts();
  await saveLocalPosts(
    posts.map((p) =>
      p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
    )
  );

  return comment;
}

export async function getUserCommentVotes() {
  const local = await loadLocalCommentVotes();
  const remote = await loadRemoteUserMap('communityCommentVotes');
  return { ...(remote || {}), ...local };
}

/**
 * Toggle thumbs-up / thumbs-down on a reply. Vote is 'up' | 'down'.
 * Tapping the same vote again clears it; switching votes moves the count.
 */
export async function toggleCommentVote(
  postId,
  commentId,
  vote,
  currentLikes = 0,
  currentDislikes = 0
) {
  if (vote !== 'up' && vote !== 'down') {
    return {
      userVote: null,
      likes: currentLikes,
      dislikes: currentDislikes,
    };
  }

  const localVotes = await loadLocalCommentVotes();
  const remoteMap = (await loadRemoteUserMap('communityCommentVotes')) || {};
  const userVotes = { ...remoteMap, ...localVotes };
  const previous = userVotes[commentId] || null;
  const next = previous === vote ? null : vote;

  let likes = Math.max(0, Number(currentLikes) || 0);
  let dislikes = Math.max(0, Number(currentDislikes) || 0);

  if (previous === 'up') likes = Math.max(0, likes - 1);
  if (previous === 'down') dislikes = Math.max(0, dislikes - 1);
  if (next === 'up') likes += 1;
  if (next === 'down') dislikes += 1;

  if (next) userVotes[commentId] = next;
  else delete userVotes[commentId];

  await saveLocalCommentVotes(userVotes);
  await saveRemoteUserMap('communityCommentVotes', userVotes);

  if (isFirebaseReady() && !String(postId).startsWith('seed-') && !String(commentId).startsWith('seed-')) {
    try {
      await updateDoc(doc(db, 'communityPosts', postId, 'comments', commentId), {
        likes,
        dislikes,
      });
    } catch (error) {
      console.warn('community comment vote sync failed', error?.message);
      throw new Error('Could not sync vote. Please try again.');
    }
  }

  const map = await loadLocalCommentsMap();
  if (map[postId]) {
    map[postId] = map[postId].map((c) =>
      c.id === commentId ? { ...c, likes, dislikes } : c
    );
    await saveLocalCommentsMap(map);
  }

  return { userVote: next, likes, dislikes };
}
