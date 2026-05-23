// ═══════════════════════════════════════════
//  FIREBASE CONFIGURATION
// ═══════════════════════════════════════════
// Replace these with your Firebase project credentials
// Get these from: Firebase Console > Project Settings > Web App Config

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByTUywCtOJDOgyZm7kdG0jj8OaJjz7c24",
  authDomain: "arf-vet-clinic.firebaseapp.com",
  projectId: "arf-vet-clinic",
  storageBucket: "arf-vet-clinic.firebasestorage.app",
  messagingSenderId: "241177489876",
  appId: "1:241177489876:web:ba6975897a5f665f24a641",
  measurementId: "G-BT00SFQRKS"
};
// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase already initialized or invalid config', error);
}

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence (optional - allows app to work offline)
db.enablePersistence().catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open - offline persistence disabled');
  } else if (err.code == 'unimplemented') {
    console.warn('Offline persistence not supported in this browser');
  }
});
