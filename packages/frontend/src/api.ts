import toast from 'react-hot-toast';

export const generateCode = async (prompt: string, model: string, style: string, attachment?: string | null) => {
  const chainOfThought = `You are an expert OpenSCAD modeler. I want to create a detailed model. First, break down the model into its main components. Then, for each component, describe how you would create it using OpenSCAD. Finally, write the OpenSCAD code to generate the entire model. The user's request is: ${prompt}`;

  const body: any = { prompt: chainOfThought, model, style };
  if (attachment) {
    body.attachment = attachment;
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorDetails = data.details || `HTTP error! status: ${response.status}`;
    throw new Error(errorDetails);
  }
  return data;
};

export const renderModel = async (code: string) => {
  const response = await fetch('/api/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const result = await response.json();
  if (!response.ok) {
    const errorDetails = result.details || `HTTP error! status: ${response.status}`;
    throw new Error(errorDetails);
  }
  return result;
};

export const getFilename = async (prompt: string) => {
  const response = await fetch('/api/filename', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  if (!data.filename) {
    throw new Error('Could not generate filename.');
  }
  return data.filename;
};

export const downloadFile = (filename: string, stlData: string, format: string) => {
  const link = document.createElement('a');
  link.href = `data:application/octet-stream;base64,${stlData}`;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const handleGenerate = async (
  prompt: string,
  selectedModel: string,
  setIsLoading: (isLoading: boolean) => void,
  setStlData: (stlData: string | null) => void,
  setGeneratedCode: (generatedCode: string) => void,
  setGenerationInfo: (generationInfo: any) => void,
  editedCode?: string,
  style?: string,
  attachment?: string | null,
  onSuccess?: (code: string) => void
) => {
  setIsLoading(true);
  setStlData(null);
  setGenerationInfo(null);

  const promise = (async () => {
    const { code, generationInfo } = editedCode
      ? { code: editedCode, generationInfo: null }
      : await generateCode(prompt, selectedModel, style || 'Default', attachment);
    
    setGeneratedCode(code);
    const { stl } = await renderModel(code);
    
    return { code, stl, generationInfo };
  })();

  await toast.promise(promise, {
    loading: editedCode ? 'Regenerating model from your code...' : `Generating model with ${selectedModel}...`,
    success: (data) => {
      setStlData(data.stl);
      if (data.generationInfo) {
        setGenerationInfo(data.generationInfo);
      }
      setIsLoading(false);
      if (onSuccess) {
        onSuccess(data.code);
      }
      return 'Successfully generated!';
    },
    error: (err) => {
      setIsLoading(false);
      return `Error: ${err.message}`;
    },
  });
};

export const handleDownload = async (prompt: string, stlData: string | null, format: string) => {
  if (!stlData) return;

  const promise = getFilename(prompt).then((filename) => {
    downloadFile(filename, stlData, format);
  });

  await toast.promise(promise, {
    loading: 'Generating filename...',
    success: 'Download started!',
    error: 'Could not generate filename.',
  });
};
