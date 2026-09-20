import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export function uploadCourseMedia(file, { unitId, lessonId, kind = 'media' }, onProgress) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `course-media/${unitId}/${lessonId}/${kind}-${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, path });
      }
    );
  });
}
