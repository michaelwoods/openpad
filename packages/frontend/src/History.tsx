import React from 'react';
import { useStore, type HistoryItem } from './store';

interface HistoryProps {
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ onClose }) => {
  const { history, loadHistoryItem, clearHistory } = useStore();

  const handleLoad = (item: HistoryItem) => {
    loadHistoryItem(item);
    onClose();
  };

  return (
    <div className="about-page"> {/* Reusing about-page class for centering/styling */}
      <div className="about-content" style={{ maxWidth: '800px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1>History</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={clearHistory} style={{ background: '#dc3545' }}>Clear History</button>
                <button onClick={onClose}>Back to Editor</button>
            </div>
        </div>
        
        {history.length === 0 ? (
          <p>No history yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((item) => (
              <div key={item.id} style={{ border: '1px solid #444', padding: '1rem', borderRadius: '8px', background: '#2a2a2a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(item.timestamp).toLocaleString()}</span>
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{item.model}</span>
                </div>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.prompt}</p>
                {item.attachment && <p style={{ fontSize: '0.8rem', color: '#88f' }}>Has attachment</p>}
                <div style={{ marginTop: '0.5rem' }}>
                    <button onClick={() => handleLoad(item)}>Load</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
