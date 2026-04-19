import { useState } from "react";
import { uploadResume } from "./api";

function App() {
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const data = await uploadResume(file);
    setResult(data);
  };

  return (
    <div>
      <h1>AI Resumer</h1>
      <input type="file" onChange={handleUpload} />
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}

export default App;