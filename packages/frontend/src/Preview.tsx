import React from 'react';
import Viewer from './Viewer';

interface PreviewProps {
  stlData: string | null;
  handleDownloadStl: () => void;
}

const Preview: React.FC<PreviewProps> = ({ stlData, handleDownloadStl }) => {
  return (
    <section className="viewer-pane">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h2>3. 3D Preview</h2>
        <button onClick={handleDownloadStl} disabled={!stlData} title="Download STL" style={{ marginTop: 0 }}>Download</button>
      </div>
      <Viewer stl={stlData} />
    </section>
  );
};

export default Preview;
