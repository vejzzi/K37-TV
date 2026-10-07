import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, collection, getDocs, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { DaySchedule, NewsArticle } from './data/tvData';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Validate Connection to Firestore on startup as mandated by Firebase skill
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore: Klijent je offline ili se baza povezuje.');
    }
  }
}

// Helpers for TV Data Sync with Firestore
export async function loadFirestoreSchedule(): Promise<DaySchedule[] | null> {
  try {
    const colRef = collection(db, 'schedules');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;
    const days: DaySchedule[] = [];
    snapshot.forEach((d) => {
      days.push(d.data() as DaySchedule);
    });
    const dayOrder = ['pon', 'uto', 'sre', 'cet', 'pet', 'sub', 'ned'];
    days.sort((a, b) => dayOrder.indexOf(a.dayId) - dayOrder.indexOf(b.dayId));
    return days.length > 0 ? days : null;
  } catch (err) {
    console.error('Greška pri čitanju rasporeda iz Firestore:', err);
    return null;
  }
}

export async function saveFirestoreSchedule(weeklySchedule: DaySchedule[]): Promise<boolean> {
  try {
    for (const day of weeklySchedule) {
      await setDoc(doc(db, 'schedules', day.dayId), {
        ...day,
        updatedAt: new Date().toISOString()
      });
    }
    return true;
  } catch (err) {
    console.error('Greška pri snimanju rasporeda u Firestore:', err);
    return false;
  }
}

export async function loadFirestoreNews(): Promise<NewsArticle[] | null> {
  try {
    const colRef = collection(db, 'news');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;
    const list: NewsArticle[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as NewsArticle);
    });
    return list.length > 0 ? list : null;
  } catch (err) {
    console.error('Greška pri čitanju vesti iz Firestore:', err);
    return null;
  }
}

export async function saveFirestoreNews(articles: NewsArticle[]): Promise<boolean> {
  try {
    for (const art of articles) {
      await setDoc(doc(db, 'news', art.id), {
        ...art
      });
    }
    return true;
  } catch (err) {
    console.error('Greška pri snimanju vesti u Firestore:', err);
    return false;
  }
}

export async function loadFirestoreTicker(): Promise<string[] | null> {
  try {
    const docRef = doc(db, 'settings', 'ticker');
    const snap = await getDocFromServer(docRef);
    if (snap.exists()) {
      return (snap.data()?.headlines as string[]) || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveFirestoreTicker(headlines: string[]): Promise<boolean> {
  try {
    await setDoc(doc(db, 'settings', 'ticker'), {
      headlines,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Greška pri snimanju kajrona u Firestore:', err);
    return false;
  }
}
