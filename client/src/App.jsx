import { useEffect, useState } from 'react';

function App() {
  // Holds the backend's answer: null while waiting, then a message
  const [status, setStatus] = useState(null);

  // Runs once when the page loads: ask the backend if it's healthy
  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((data) => setStatus(`API: ${data.status}, database: ${data.database}`))
      .catch(() => setStatus('Could not reach the API. Is the server running?'));
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>SupplyChain Passport</h1>
      <p>{status ?? 'Checking API…'}</p>
    </main>
  );
}

export default App;