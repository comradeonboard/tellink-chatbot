import React, { useState, useRef, useEffect } from 'react';

const API_URL = '/api/chat';

function Chat({ customerId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [customerId]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, question: text }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      if (res.status === 401) {
        setError('Authentication failed. Check your API key.');
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.content;
              if (delta) {
                fullText += delta;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    updated[updated.length - 1] = { ...last, content: fullText };
                  }
                  return updated;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: 12,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      height: '70vh',
      minHeight: 400,
    }}>
      <div style={{
        background: '#1a1a2e',
        color: '#fff',
        padding: '12px 16px',
        fontSize: 15,
        fontWeight: 600,
        flexShrink: 0,
      }}>
        TelLink Support Chat
      </div>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: '#f9f9fb',
      }}>
        {messages.length === 0 && !loading && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', fontSize: 14 }}>
            Ask TelLink a question about your account, services, or policies.
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? '#e94560' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#333',
              padding: '10px 14px',
              borderRadius: 12,
              maxWidth: '85%',
              fontSize: 14,
              lineHeight: 1.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              wordWrap: 'break-word',
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: '#fff',
            padding: '10px 14px',
            borderRadius: 12,
            fontSize: 14,
            color: '#888',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            Typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      {error && (
        <div style={{ padding: '8px 16px', background: '#fff3f3', color: '#c0392b', fontSize: 13, borderTop: '1px solid #fdd', flexShrink: 0 }}>
          {error}
        </div>
      )}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: 12,
        background: '#fff',
        borderTop: '1px solid #eee',
        flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
            minWidth: 0,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: '#e94560',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            opacity: loading || !input.trim() ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default Chat;