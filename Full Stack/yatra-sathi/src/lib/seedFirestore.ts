/**
 * One-time seed script: reads Data/property.json and writes all properties + meta to Firestore.
 * Run: npx tsx src/lib/seedFirestore.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const firebaseConfig = {
  apiKey: 'AIzaSyDuroGYMSVbcmX6jkQqsizdeQ4T9LEF6fo',
  authDomain: 'yatrasathi-a341c.firebaseapp.com',
  projectId: 'yatrasathi-a341c',
  storageBucket: 'yatrasathi-a341c.firebasestorage.app',
  messagingSenderId: '110414933268',
  appId: '1:110414933268:web:5c28d7e1b7f46996ca2601',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  const jsonPath = resolve(__dirname, '../../Data/property.json');
  const raw = readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);

  // Save meta
  await setDoc(doc(db, 'config', 'meta'), data.meta);
  console.log('✅ Meta saved');

  // Save weights
  if (data.feasibility_score_weights) {
    await setDoc(doc(db, 'config', 'feasibility_score_weights'), data.feasibility_score_weights);
    console.log('✅ Feasibility weights saved');
  }

  // Save transport config
  if (data.transport_cost_config) {
    await setDoc(doc(db, 'config', 'transport_cost_config'), data.transport_cost_config);
    console.log('✅ Transport config saved');
  }

  // Save properties
  for (const prop of data.properties) {
    await setDoc(doc(collection(db, 'properties'), prop.id), prop);
    console.log(`✅ Property ${prop.id}: ${prop.title}`);
  }

  console.log(`\n🎉 Seeded ${data.properties.length} properties to Firestore!`);
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
