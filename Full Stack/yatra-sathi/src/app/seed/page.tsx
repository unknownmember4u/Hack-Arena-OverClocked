'use client';

/**
 * Seed page — one-time tool to migrate property.json data to Firestore.
 * Visit /seed in browser, click the button, and all 16 properties will be uploaded.
 */

import { useState } from 'react';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import propertyDataJson from '../../../Data/property.json';
import { Loader2, CheckCircle, Database } from 'lucide-react';

export default function SeedPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setRunning(true);
    setStatus([]);
    const data = propertyDataJson as Record<string, unknown>;

    try {
      // Save meta
      if (data.meta) {
        await setDoc(doc(db, 'config', 'meta'), data.meta as Record<string, unknown>);
        setStatus((s) => [...s, '✅ Meta saved']);
      }

      // Save feasibility weights
      if (data.feasibility_score_weights) {
        await setDoc(doc(db, 'config', 'feasibility_score_weights'), data.feasibility_score_weights as Record<string, unknown>);
        setStatus((s) => [...s, '✅ Feasibility weights saved']);
      }

      // Save transport config
      if (data.transport_cost_config) {
        await setDoc(doc(db, 'config', 'transport_cost_config'), data.transport_cost_config as Record<string, unknown>);
        setStatus((s) => [...s, '✅ Transport config saved']);
      }

      // Save each property
      const properties = (data.properties || []) as Array<Record<string, unknown>>;
      for (const prop of properties) {
        const id = prop.id as string;
        await setDoc(doc(collection(db, 'properties'), id), prop);
        setStatus((s) => [...s, `✅ ${id}: ${prop.title}`]);
      }

      setStatus((s) => [...s, `\n🎉 Done! Seeded ${properties.length} properties.`]);
      setDone(true);
    } catch (err: unknown) {
      setStatus((s) => [...s, `❌ Error: ${(err as Error).message}`]);
    }
    setRunning(false);
  };

  return (
    <div className="dash-page">
      <div className="dash-content" style={{ maxWidth: 600 }}>
        <div className="dash-section">
          <h2 className="dash-section-title"><Database size={18} /> Seed Firestore</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
            Click the button below to upload all {((propertyDataJson as Record<string, unknown>).properties as Array<unknown>)?.length || 0} properties
            from <code>property.json</code> to Firestore. This is a one-time operation.
          </p>

          {!done ? (
            <button className="dash-btn dash-btn-primary" onClick={handleSeed} disabled={running}>
              {running ? <><Loader2 size={14} className="spin" /> Seeding…</> : <><Database size={14} /> Seed Now</>}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#22c55e', fontWeight: 700, fontSize: '0.8125rem' }}>
              <CheckCircle size={16} /> All data seeded successfully!
            </div>
          )}

          {status.length > 0 && (
            <pre style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              maxHeight: 400,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}>
              {status.join('\n')}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
