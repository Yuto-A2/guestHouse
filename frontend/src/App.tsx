import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

interface ApiResponse {
  message: string;
  status?: string;
  timestamp?: string;
}

function App() {
  const [apiMessage, setApiMessage] = useState<string>('');
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      // Test main endpoint
      const response = await axios.get<ApiResponse>('http://localhost:3000/');
      setApiMessage(response.data.message);

      // Test health endpoint
      const healthResponse = await axios.get<ApiResponse>('http://localhost:3000/api/health');
      setHealthStatus(`Status: ${healthResponse.data.status} (${healthResponse.data.timestamp})`);
    } catch (error) {
      setApiMessage('Backend connection failed');
      setHealthStatus('Health check failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Guesthouse Frontend</h1>
        <div style={{ margin: '20px 0' }}>
          <h3>Backend API Connection Test</h3>
          {loading ? (
            <p>Testing connection...</p>
          ) : (
            <div>
              <p><strong>API Message:</strong> {apiMessage}</p>
              <p><strong>Health Check:</strong> {healthStatus}</p>
            </div>
          )}
          <button onClick={testBackendConnection} disabled={loading}>
            Test Connection Again
          </button>
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
