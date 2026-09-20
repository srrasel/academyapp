import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const COURSE_ID = 'general-psychology';

async function fetchPublicJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

export async function seedImportedCourse() {
  const [course, units, lessons] = await Promise.all([
    fetchPublicJson('/course/en/course.json'),
    fetchPublicJson('/course/en/units.json'),
    fetchPublicJson('/course/en/lessons.json'),
  ]);

  const { id, wpCourseId, sourceUrl, ...courseData } = course;

  await setDoc(
    doc(db, 'courses', COURSE_ID),
    {
      ...courseData,
      id: COURSE_ID,
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  await setDoc(doc(db, 'appConfig', 'main'), {
    quoteOfDay: {
      text: 'Understanding yourself is the first step to understanding others.',
      author: 'Carl Jung',
    },
  });

  for (const unit of units) {
    await setDoc(doc(db, 'units', String(unit.id)), {
      ...unit,
      courseId: COURSE_ID,
    });
  }

  for (const lesson of lessons) {
    await setDoc(doc(db, 'lessons', String(lesson.id)), {
      ...lesson,
      courseId: COURSE_ID,
    });
  }

  return {
    courseId: COURSE_ID,
    units: units.length,
    lessons: lessons.length,
  };
}

/** @deprecated Use seedImportedCourse */
export async function seedDemoData() {
  return seedImportedCourse();
}
