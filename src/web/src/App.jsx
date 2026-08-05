import React, { useState } from 'react';
import Chat from './components/Chat';

function App() {
  const [customerId, setCustomerId] = useState(1);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <header style={{ background: '#1a1a2e', color: '#fff', padding: '16px 24px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/logo.svg" alt="TelLink" style={{ width: 40, height: 40 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>TelLink Customer Support</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: 14 }}>AI-Powered Assistance</p>
        </div>
      </header>
      <Chat customerId={customerId} />
    </div>
  );
}

export default App;