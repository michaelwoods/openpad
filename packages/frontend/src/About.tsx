import './App.css';

interface AboutProps {
  onClose: () => void;
}

export default function About({ onClose }: AboutProps) {
  return (
    <div className="about-page">
      <div className="about-content">
        <h1>About OpenPAD</h1>
        <p>
          OpenPAD (Open Prompt Aided Design) is a web-based tool designed to bridge the gap between natural language and 3D modeling.
        </p>
        <p>
          Using the power of Google's Gemini generative AI, you can describe a 3D object in plain English, and OpenPAD will generate the corresponding OpenSCAD code. The application provides an instant 3D preview of the generated model, allowing for rapid prototyping and iteration.
        </p>
        <p>
          This project was bootstrapped and developed with the assistance of an AI agent to demonstrate the capabilities of AI-driven software development.
        </p>
        <button onClick={onClose}>Back to Editor</button>
      </div>
    </div>
  );
}
