/* =========================================================
   database.js — Firebase + localStorage Hybrid Database
   ========================================================= */

const DB = (() => {
  // ---- Firebase Configuration (placeholder — replace with your own) ----
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCnNHUDiQ5UwYWhzqpEE3AMHJXwCt7JMzg",
    authDomain: "mediverify-36a53.firebaseapp.com",
    projectId: "mediverify-36a53",
    storageBucket: "mediverify-36a53.firebasestorage.app",
    messagingSenderId: "346700658299",
    appId: "1:346700658299:web:0ed770b0eaafdd000f54de"
  };

  const LS_KEY = 'mediverify_medicines';
  let firebaseReady = false;
  let db = null;

  // ---- Initialize Firebase ----
  function initFirebase() {
    try {
      if (window.firebase && firebase.firestore) {
        const app = firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.firestore();
        firebaseReady = true;
        console.log('[DB] Firebase connected');
      } else {
        console.log('[DB] Firebase config not set — using localStorage only');
      }
    } catch (err) {
      console.warn('[DB] Firebase init failed:', err.message);
    }
    return firebaseReady;
  }

  // ---- localStorage helpers ----
  function lsRead() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function lsWrite(data) {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  // ---- Seed preloaded medicines into localStorage if not present ----
  function seedDefaults() {
    const existing = lsRead();
    if (existing.length === 0) {
      lsWrite(PRELOADED_MEDICINES);
      return PRELOADED_MEDICINES;
    }

    // Merge: add any preloaded meds that don't exist yet
    const existingIds = new Set(existing.map(m => m.id));
    let merged = [...existing];
    for (const med of PRELOADED_MEDICINES) {
      if (!existingIds.has(med.id)) {
        merged.push(med);
      }
    }
    lsWrite(merged);
    return merged;
  }

  // ---- Public API ----

  function init() {
    const fbOk = initFirebase();
    seedDefaults();
    return fbOk;
  }

  function isFirebaseReady() {
    return firebaseReady;
  }

  // Get all medicines
  async function getAll() {
    // Try Firebase first
    if (firebaseReady) {
      try {
        const snap = await db.collection('medicines').get();
        const meds = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (meds.length > 0) {
          // Sync to localStorage
          lsWrite(meds);
          return meds;
        }
      } catch (err) {
        console.warn('[DB] Firebase read failed, falling back:', err.message);
      }
    }
    return lsRead();
  }

  // Search by name (partial, case-insensitive)
  async function searchByName(query) {
    const all = await getAll();
    const q = query.toLowerCase().trim();
    return all.filter(m => m.name.toLowerCase().includes(q));
  }

  // Search by barcode (exact match)
  async function searchByBarcode(barcode) {
    const all = await getAll();
    return all.find(m => m.barcode === barcode.trim()) || null;
  }

  // Add a new medicine
  async function addMedicine(med) {
    // Generate an ID
    med.id = 'med_' + Date.now();

    // Write to Firebase
    if (firebaseReady) {
      try {
        await db.collection('medicines').doc(med.id).set(med);
      } catch (err) {
        console.warn('[DB] Firebase write failed:', err.message);
      }
    }

    // Always write to localStorage
    const all = lsRead();
    all.push(med);
    lsWrite(all);
    return med;
  }

  // Delete a medicine
  async function deleteMedicine(id) {
    if (firebaseReady) {
      try {
        await db.collection('medicines').doc(id).delete();
      } catch (err) {
        console.warn('[DB] Firebase delete failed:', err.message);
      }
    }
    const all = lsRead().filter(m => m.id !== id);
    lsWrite(all);
  }
  function closeModal() {
  const modal = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('show');
  window.App = window.App || {};
window.App.closeModal = closeModal;
}

  return { init, isFirebaseReady, getAll, searchByName, searchByBarcode, addMedicine, deleteMedicine };
})();
window.UI = UI;