import React from 'react';
import Viewer from './Viewer';
import { useStore } from './store';
import { handleDownload } from './api';

const Preview: React.FC = () => {
  const {
    stlData,
    prompt,
    previewColor,
    setPreviewColor,
  } = useStore();
  const [format, setFormat] = React.useState('stl');

  const onDownload = () => {
    handleDownload(prompt, stlData, format);
  };

  return (
    <section className="viewer-pane">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h2>3. 3D Preview</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input 
            type="color" 
            value={previewColor} 
            onChange={(e) => setPreviewColor(e.target.value)} 
            title="Change Model Color"
          />
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="stl">STL</option>
            <option value="amf">AMF (color)</option>
            <option value="3mf">3MF (color)</option>
          </select>
          <button onClick={onDownload} disabled={!stlData} title="Download Model" style={{ marginTop: 0 }}>Download</button>
        </div>
      </div>
      <Viewer stl={stlData} format={format} color={previewColor} />
    </section>
  );
};

export default Preview;