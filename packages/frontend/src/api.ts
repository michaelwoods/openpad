import toast from 'react-hot-toast';

export const handleGenerate = async (
  prompt: string,
  selectedModel: string,
  setIsLoading: (isLoading: boolean) => void,
  setStlData: (stlData: string | null) => void,
  setGeneratedCode: (generatedCode: string) => void,
  setGenerationInfo: (generationInfo: any) => void
) => {
  setIsLoading(true);
  setStlData(null);
  setGenerationInfo(null);

  const chainOfThought = `You are an expert OpenSCAD modeler. I want to create a detailed model. First, break down the model into its main components. Then, for each component, describe how you would create it using OpenSCAD. Finally, write the OpenSCAD code to generate the entire model. The user's request is: ${prompt}`;

  const promise = fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: chainOfThought, model: selectedModel }),
  }).then(async (response) => {
    const data = await response.json();
    if (!response.ok) {
      const errorDetails = data.details || `HTTP error! status: ${response.status}`;
      throw new Error(errorDetails);
    }
    return data;
  });

  toast.promise(promise, {
    loading: `Generating model with ${selectedModel}...`,
    success: (data) => {
      setGeneratedCode(data.code);
      setStlData(data.stl);
      setGenerationInfo(data.generationInfo);
      return 'Successfully generated!';
    },
    error: (err) => {
      setGeneratedCode(`// Error generating code.\n\n${err.message}`);
      return `Error: ${err.message}`;
    },
  }).finally(() => {
    setIsLoading(false);
  });
};

export const handleDownloadStl = async (prompt: string, stlData: string | null) => {
  if (!stlData) return;

  const promise = fetch('/api/filename', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.filename) throw new Error('Could not generate filename.');
      const link = document.createElement('a');
      link.href = `data:application/octet-stream;base64,${stlData}`;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

  toast.promise(promise, {
    loading: 'Generating filename...',
    success: 'Download started!',
    error: 'Could not generate filename.',
  });
};