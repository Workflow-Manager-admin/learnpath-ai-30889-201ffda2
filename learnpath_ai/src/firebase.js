import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

/**
 * PUBLIC_INTERFACE
 * Firebase initialization and Firestore progress helper logic.
 * Replace the firebaseConfig content with your Firebase project's config!
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// PUBLIC_INTERFACE
/**
 * Save step progress for a unique user/session.
 * @param {string} userId
 * @param {string} goal
 * @param {object} progressObj
 */
export async function saveUserProgress(userId, goal, progressObj) {
  if (!userId || !goal) return;
  const safeGoal = encodeURIComponent(goal);
  await setDoc(doc(db, "progress", `${userId}-${safeGoal}`), {
    userId,
    goal,
    progress: progressObj,
    updated: Date.now()
  });
}

/**
 * Retrieve saved progress for user+goal combo.
 * @param {string} userId
 * @param {string} goal
 * @returns {object|null}
 */
export async function fetchUserProgress(userId, goal) {
  if (!userId || !goal) return null;
  const safeGoal = encodeURIComponent(goal);
  const docRef = doc(db, "progress", `${userId}-${safeGoal}`);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data().progress;
  }
  return null;
}
