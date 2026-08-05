import React, { useState } from 'react';
import Chat from './components/Chat';

function App() {
  const [customerId, setCustomerId] = useState(1);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <header style={{ background: '#1a1a2e', color: '#fff', padding: '16px 24px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/favicon.svg" alt="TelLink Logo" style={{ width: 36, height: 36 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>TelLink Customer Support</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: 14 }}>AI-Powered Assistance</p>
        </div>
      </header>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="customer-select" style={{ fontWeight: 600, marginRight: 8 }}>Customer ID:</label>
        <select
          id="customer-select"
          value={customerId}
          onChange={(e) => setCustomerId(Number(e.target.value))}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
        >
          <option value={1}>Alice Johnson (ID: 1)</option>
          <option value={2}>Bob Smith (ID: 2)</option>
          <option value={3}>Carol Williams (ID: 3)</option>
          <option value={4}>David Brown (ID: 4)</option>
          <option value={5}>Eve Davis (ID: 5)</option>
        </select>
      </div>
      <Chat customerId={customerId} />
    </div>
  );
}

export default App;